import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {OpenstackDataSource} from '../datasources';
import {factory} from '../log4ts';
import {RestApplication} from '@loopback/rest';
import {WafBindingKeys} from '../keys';

export interface IdentityService {
  v2AuthToken(url: string, body: object): Promise<object>;
  v2ValidateToken(url: string): Promise<object>;
  v3AuthToken(url: string, body: object): Promise<object>;
  v3ValidateToken(
    url: string,
    adminToken: string,
    userToken: string,
  ): Promise<object>;
}

export class IdentityServiceProvider implements Provider<IdentityService> {
  constructor(
    // openstack must match the name property in the datasource json file
    @inject('datasources.openstack')
    protected dataSource: OpenstackDataSource = new OpenstackDataSource(),
  ) {}

  value(): Promise<IdentityService> {
    return getService(this.dataSource);
  }
}

export abstract class AuthWithOSIdentity {
  protected logger = factory.getLogger(
    'auth.process.AuthWithOSIdentity.' + this.authConfig.version,
  );

  constructor(
    protected authConfig: AuthConfig,
    protected application: RestApplication,
    protected identityService: IdentityService,
  ) {}

  abstract adminAuthToken(): Promise<AuthedToken>;
  abstract validateUserToken(
    adminToken: string,
    userToken: string,
    tenantId?: string,
  ): Promise<AuthedToken>;

  // async bindIdentityService() {
  //   // TODO: use bind/inject to use IdentityService:
  //   // @inject('services.IdentityService') works differently within/outside of
  //   // Controller. It doesn't work outside of Controller. So here we make call
  //   // to Provider explicitly.
  //   await new IdentityServiceProvider().value().then(idenServ => {
  //     this.identityService = idenServ;
  //   });
  // }
}

class AuthWithIdentityV2 extends AuthWithOSIdentity {
  async adminAuthToken(): Promise<AuthedToken> {
    let url = this.authConfig.osAuthUrl + '/tokens';
    let reqBody = {
      auth: {
        passwordCredentials: {
          username: this.authConfig.osUsername,
          password: this.authConfig.osPassword,
        },
        tenantName: this.authConfig.osTenantName,
      },
    };

    try {
      let adminToken = await this.identityService
        .v2AuthToken(url, reqBody)
        .then(response => {
          this.logger.debug('adminAuthToken done.');
          //this.logger.debug(JSON.stringify(response));
          return this.parseAuthResponseNoException(response);
        });

      // TODO: don't bind values in services, move it to top level invocation.
      this.application.bind(WafBindingKeys.KeyAdminAuthedToken).to(adminToken);
      return Promise.resolve(adminToken);
    } catch (error) {
      throw new Error('Failed to request /v2.0/tokens: ' + error.message);
    }
  }

  async validateUserToken(
    adminToken: string,
    userToken: string,
    tenantId?: string,
  ): Promise<AuthedToken> {
    let url = this.authConfig.osAuthUrl + '/tokens/' + userToken;
    if (tenantId) url = url + '?belongsTo=' + tenantId;

    try {
      return await this.identityService.v2ValidateToken(url).then(response => {
        return this.parseAuthResponseNoException(response);
      });
    } catch (error) {
      throw new Error('Failed to request identity service: ' + error);
    }
  }

  private parseAuthResponseNoException(response: object): AuthedToken {
    let authedToken = new AuthedToken();

    let respJson = JSON.parse(JSON.stringify(response));

    let access = respJson[0]['access'];
    authedToken.issuedAt = new Date(access['token']['issued_at']);
    authedToken.expiredAt = new Date(access['token']['expires']);
    authedToken.token = access['token']['id'];

    authedToken.userId = access['user']['id'];
    authedToken.catalog = access['serviceCatalog'];

    return authedToken;
  }
}

class AuthWithIdentityV3 extends AuthWithOSIdentity {
  async adminAuthToken(): Promise<AuthedToken> {
    let url = this.authConfig.osAuthUrl + '/auth/tokens';
    let reqBody = {
      auth: {
        identity: {
          methods: ['password'],
          password: {
            user: {
              name: this.authConfig.osUsername,
              password: this.authConfig.osPassword,
              domain: {name: <string>this.authConfig.osDomainName},
            },
          },
        },
        scope: {
          project: {
            domain: {name: <string>this.authConfig.osDomainName},
            name: this.authConfig.osTenantName,
          },
        },
      },
    };

    try {
      let adminToken = new AuthedToken();
      await this.identityService.v3AuthToken(url, reqBody).then(response => {
        adminToken = this.parseAuthResponseNoException(response);
      });
      // TODO: return the promise returned by v3AuthToken. so do all 'Promise.resolve'.

      return Promise.resolve(adminToken);
    } catch (e) {
      throw new Error('Failed to request from identity service: ' + e);
    }
  }

  async validateUserToken(
    adminToken: string,
    userToken: string,
    tenantId?: string,
  ): Promise<AuthedToken> {
    // tenantId is useless in v3/auth/tokens
    // since tenant info can be retrieved from token validation.
    let url = this.authConfig.osAuthUrl + '/auth/tokens';
    try {
      let authedToken = new AuthedToken();
      await this.identityService
        .v3ValidateToken(url, adminToken, userToken)
        .then(response => {
          authedToken = this.parseAuthResponseNoException(response);
        });

      return Promise.resolve(authedToken);
    } catch (error) {
      throw new Error('Failed to request from identity service: ' + error);
    }
  }

  private parseAuthResponseNoException(response: object): AuthedToken {
    let authedToken = new AuthedToken();

    let respJson = JSON.parse(JSON.stringify(response));

    let token = respJson[0]['token'];
    authedToken.issuedAt = new Date(token['issued_at']);
    authedToken.expiredAt = new Date(token['expires_at']);
    authedToken.token = ''; // TODO: find it from header.

    authedToken.userId = token['user']['id'];
    authedToken.catalog = token['catalog'];

    return authedToken;
  }
}

export class AuthWithIdentityUnknown extends AuthWithOSIdentity {
  adminAuthToken(): Promise<AuthedToken> {
    throw new Error('Not Implemented, unknown AuthWithOSIdentity.');
  }
  validateUserToken(
    adminToken: string,
    userToken: string,
    tenantId: string,
  ): Promise<AuthedToken> {
    throw new Error('Not Implemented, unknown AuthWithOSIdentity.');
  }
}

// TODO: rename it to AuthFactory or so, so do other component.
export class AuthManager {
  private authConfig: AuthConfig = new AuthConfig();

  constructor(
    private application: RestApplication,
    private identityService: IdentityService,
  ) {
    let authProps: string[];
    let emptyProps: string[] = [];

    if (!process.env.OS_AUTH_URL || process.env.OS_AUTH_URL === '')
      throw new Error(`Not authorized, env OS_AUTH_URL not set`);

    this.authConfig.osAuthUrl = process.env.OS_AUTH_URL;

    if (process.env.OS_AUTH_URL.endsWith('/v2.0')) {
      this.authConfig.version = 'v2.0';
      authProps = ['OS_USERNAME', 'OS_PASSWORD', 'OS_TENANT_NAME'];
    } else if (process.env.OS_AUTH_URL.endsWith('v3')) {
      this.authConfig.version = 'v3';
      authProps = [
        'OS_USERNAME',
        'OS_PASSWORD',
        'OS_TENANT_NAME',
        'OS_DOMAIN_NAME',
      ];
    } else {
      throw new Error(
        `Not authorized, invalide identity url: ${process.env.OS_AUTH_URL}`,
      );
    }

    authProps.forEach(prop => {
      if (!process.env[prop] || process.env[prop] === '') emptyProps.push(prop);
    });
    if (emptyProps.length !== 0)
      throw new Error(`Not authorized, missing env variables: ${emptyProps}`);

    this.authConfig.osUsername = <string>process.env.OS_USERNAME;
    this.authConfig.osPassword = <string>process.env.OS_PASSWORD;
    this.authConfig.osTenantName = <string>process.env.OS_TENANT_NAME;
    this.authConfig.osDomainName = process.env.OS_DOMAIN_NAME;

    return this;
  }

  createAuthWorker(): AuthWithOSIdentity {
    let authWithOSIdentity: AuthWithOSIdentity;

    switch (this.authConfig.version) {
      case 'v2.0':
        authWithOSIdentity = new AuthWithIdentityV2(
          this.authConfig,
          this.application,
          this.identityService,
        );
        break;
      case 'v3':
        authWithOSIdentity = new AuthWithIdentityV3(
          this.authConfig,
          this.application,
          this.identityService,
        );
        break;
      default:
        authWithOSIdentity = new AuthWithIdentityUnknown(
          this.authConfig,
          this.application,
          this.identityService,
        );
        break;
    }

    return authWithOSIdentity;
  }
}

class AuthConfig {
  version: string;
  osAuthUrl: string;
  osUsername: string;
  osPassword: string;
  osTenantName: string;
  osDomainName?: string;
}

export class AuthedToken {
  token: string;
  userId: string;
  issuedAt: Date;
  expiredAt: Date;
  // TODO: extends endpoints sub session of catalog to make it compatible
  // for v2.0 and v3.
  catalog: {
    endpoints: object[];
    type: string;
    name: string;
  }[];
  tenantId: string;
}
