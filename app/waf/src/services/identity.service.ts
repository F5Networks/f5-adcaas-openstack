import {getService} from '@loopback/service-proxy';
import {inject, Provider, CoreBindings} from '@loopback/core';
import {OpenstackDataSource} from '../datasources';
import {factory} from '../log4ts';
import {RestApplication} from '@loopback/rest';
import {bindingKeyAdminAuthedToken} from '../components';

export interface IdentityService {
  v2AuthToken(
    url: string,
    osUsername: string,
    osPassword: string,
    tenantName: string,
  ): Promise<object>;

  v2ValidateToken(url: string, userTokenRequestBody: object): Promise<object>;

  v3AuthToken(
    url: string,
    osUsername: string,
    osPassword: string,
    tenantName: string,
    domainName: string,
  ): Promise<object>;

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
  @inject('services.IdentityService')
  protected identityService: IdentityService;
  @inject(CoreBindings.APPLICATION_INSTANCE)
  protected application: RestApplication;

  protected logger = factory.getLogger(
    'auth.process.AuthWithOSIdentity.' + this.authConfig.version,
  );

  constructor(protected authConfig: AuthConfig) {}

  abstract adminAuthToken(): Promise<AuthedToken>;
  abstract validateUserToken(
    userToken: string,
    tenantName?: string,
  ): Promise<AuthedToken>;

  async bindIdentityService() {
    // TODO: use bind/inject to use IdentityService:
    // @inject('services.IdentityService') works differently within/outside of
    // Controller. It doesn't work outside of Controller. So here we make call
    // to Provider explicitly.
    await new IdentityServiceProvider().value().then(idenServ => {
      this.identityService = idenServ;
    });
  }
}

class AuthWithIdentityV2 extends AuthWithOSIdentity {
  async adminAuthToken(): Promise<AuthedToken> {
    try {
      let adminToken = new AuthedToken();

      await this.identityService
        .v2AuthToken(
          this.authConfig.osAuthUrl,
          this.authConfig.osUsername,
          this.authConfig.osPassword,
          this.authConfig.osTenantName,
        )
        .then(
          response => {
            this.logger.debug('adminAuthToken');
            //this.logger.debug(JSON.stringify(response));
            try {
              adminToken = this.parseAuthResponseNoException(response);
              this.application.bind(bindingKeyAdminAuthedToken).to(adminToken);
            } catch (e) {
              throw new Error(
                'Failed to parse response from /v2.0/token: ' + e,
              );
            }
          },
          reason => {
            throw new Error('Failed to request /v2.0/tokens' + reason);
          },
        );

      return Promise.resolve(adminToken);
    } catch (error) {
      throw new Error('Failed to request /v2.0/tokens' + error);
    }
  }

  async validateUserToken(
    userToken: string,
    tenantName?: string,
  ): Promise<AuthedToken> {
    let authedToken = new AuthedToken();

    let reqBody = new UserTokenRequestBody();
    reqBody.auth.token.id = userToken;
    if (tenantName) reqBody.auth.tenantName = tenantName;

    try {
      await this.identityService
        .v2ValidateToken(this.authConfig.osAuthUrl, reqBody)
        .then(
          response => {
            try {
              authedToken = this.parseAuthResponseNoException(response);
            } catch (e) {
              throw new Error(
                'Failed to parse response from identity service: ' + e,
              );
            }
          },
          reason => {
            throw new Error('Failed to request identity service: ' + reason);
          },
        );

      return Promise.resolve(authedToken);
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
    let adminToken = new AuthedToken();

    try {
      await this.identityService
        .v3AuthToken(
          this.authConfig.osAuthUrl,
          this.authConfig.osUsername,
          this.authConfig.osPassword,
          this.authConfig.osTenantName,
          <string>this.authConfig.osDomainName,
        )
        .then(
          response => {
            adminToken = this.parseAuthResponseNoException(response);
          },
          reason => {
            throw new Error(
              'Failed to request from identity service: ' + reason,
            );
          },
        );

      return Promise.resolve(adminToken);
    } catch (e) {
      throw new Error('Failed to request from identity service: ' + e);
    }
  }

  async validateUserToken(
    userToken: string,
    tenantName?: string,
  ): Promise<AuthedToken> {
    // tenantName is useless in v3/auth/tokens
    let authedToken = new AuthedToken();

    try {
      let adminToken = await this.application.get<AuthedToken>(
        bindingKeyAdminAuthedToken,
      );
      await this.identityService
        .v3ValidateToken(this.authConfig.osAuthUrl, adminToken.token, userToken)
        .then(
          response => {
            try {
              authedToken = this.parseAuthResponseNoException(response);
            } catch (e) {
              throw new Error('Failed to request from identity service: ' + e);
            }
          },
          reason => {
            throw new Error('Failed to request identity service' + reason);
          },
        );

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
    authedToken.token = ''; // from header.
    authedToken.userId = token['user']['id'];
    authedToken.catalog = token['catalog'];

    return authedToken;
  }
}

export class AuthWithIdentityUnknown extends AuthWithOSIdentity {
  adminAuthToken(): Promise<AuthedToken> {
    throw new Error('Not Implemented, unknown AuthWithOSIdentity.');
  }
  validateUserToken(userToken: string): Promise<AuthedToken> {
    throw new Error('Not Implemented, unknown AuthWithOSIdentity.');
  }
}

export class AuthManager {
  private authConfig: AuthConfig = new AuthConfig();

  constructor() {
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

  async createAuthWorker(): Promise<AuthWithOSIdentity> {
    let authWithOSIdentity: AuthWithOSIdentity;

    switch (this.authConfig.version) {
      case 'v2.0':
        authWithOSIdentity = new AuthWithIdentityV2(this.authConfig);
        break;
      case 'v3':
        authWithOSIdentity = new AuthWithIdentityV3(this.authConfig);
        break;
      default:
        authWithOSIdentity = new AuthWithIdentityUnknown(this.authConfig);
        break;
    }
    await authWithOSIdentity.bindIdentityService();

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

class UserTokenRequestBody {
  auth: {
    token: {
      id: string;
    };
    tenantName?: string;
  };
}

export class AuthedToken {
  token: string;
  userId: string;
  issuedAt: Date;
  expiredAt: Date;
  catalog: {
    endpoints: object[];
    type: string;
    name: string;
  }[];
}
