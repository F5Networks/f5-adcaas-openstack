import {inject, CoreBindings} from '@loopback/core';
import {ServersParams} from '../../../src/services';
import {PortCreationParams} from '../../../src/services/network.service';
import {factory} from '../../../src/log4ts';
import {get, requestBody, RestApplication} from '@loopback/rest';
import {WafBindingKeys} from '../../../src/keys';
import {MockBaseController} from './mocks/mock.base.controller';

class Environs {
  [key: string]: string | undefined;
}

class Parameters {
  // for adminToken
  // none

  // for validateUserToken
  adminToken: string;
  userToken: string;
  tenantId: string;

  // for createVirtualServer
  // userToken
  //tenantId: string;
  networkId: string;
  imageRef: string;
  flavorRef: string;
  securityGroupName: string;
  vmName: string;

  // for createVirtual Server with port
  portId: string;
  // tenantId: string;
  // imageRef: string;
  // flavorRef: string;
  // securityGroupName: string;
  // vmName: string;

  // for virtualServerDetail
  serverId: string;
  // userToken
}

export class RequestBody {
  env: Environs;
  param: Parameters;
}

export class OpenstackController extends MockBaseController {
  private logger = factory.getLogger('tests.openstack');

  constructor(
    // @inject('services.IdentityService')
    // private identityService: IdentityService,
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: RestApplication,
  ) {
    super();
    // need to unbind it for re-auth admin token from start.
    this.application.unbind(WafBindingKeys.KeyAdminAuthedToken);
  }

  @get('/openstack/adminAuthToken')
  async adminAuthToken(@requestBody() reqBody: RequestBody): Promise<object> {
    return this.tryRunWithEnvs(reqBody.env, async () => {
      const authWithOSIdentity = await this.application.get(
        WafBindingKeys.KeyAuthWithOSIdentity,
      );
      return authWithOSIdentity.solveAdminToken();
    });
  }

  @get('/openstack/validateUserToken')
  async validateUserToken(
    @requestBody() reqBody: RequestBody,
  ): Promise<object> {
    return this.tryRunWithEnvs(reqBody.env, async () => {
      const authWithOSIdentity = await this.application.get(
        WafBindingKeys.KeyAuthWithOSIdentity,
      );

      return await authWithOSIdentity.solveAdminToken().then(async () => {
        return await authWithOSIdentity.validateUserToken(
          reqBody.param.adminToken,
          reqBody.param.userToken,
          reqBody.param.tenantId,
        );
      });
    });
  }

  @get('/openstack/createVirtualServer')
  async createVirtualServer(
    @requestBody() reqBody: RequestBody,
  ): Promise<object> {
    return this.tryRunWithEnvs(reqBody.env, async () => {
      const authWithOSIdentity = await this.application.get(
        WafBindingKeys.KeyAuthWithOSIdentity,
      );

      const computeMgr = await this.application.get(
        WafBindingKeys.KeyComputeManager,
      );

      let serversParams: ServersParams = {
        userTenantId: reqBody.param.tenantId,
        networkId: reqBody.param.networkId,
        imageRef: reqBody.param.imageRef,
        flavorRef: reqBody.param.flavorRef,
        securityGroupName: reqBody.param.securityGroupName,
        vmName: reqBody.param.vmName,
        ports: [reqBody.param.portId],
      };

      // Need to generate admin token to retrieve catalog.
      return authWithOSIdentity.solveAdminToken().then(async () => {
        return {
          id: await computeMgr.createServer(
            reqBody.param.userToken,
            serversParams,
          ),
        };
      });
    });
  }

  @get('/openstack/virtualServerDetail')
  async virtualServerDetail(
    @requestBody() reqBody: RequestBody,
  ): Promise<object> {
    return this.tryRunWithEnvs(reqBody.env, async () => {
      const authWithOSIdentity = await this.application.get(
        WafBindingKeys.KeyAuthWithOSIdentity,
      );

      const computeMgr = await this.application.get(
        WafBindingKeys.KeyComputeManager,
      );

      return authWithOSIdentity.solveAdminToken().then(() => {
        return computeMgr.getServerDetail(
          reqBody.param.userToken,
          reqBody.param.serverId,
          reqBody.param.tenantId,
        );
      });
    });
  }

  @get('/openstack/createPort')
  async createPort(@requestBody() reqBody: RequestBody): Promise<object> {
    return this.tryRunWithEnvs(reqBody.env, async () => {
      const networkDriver = await this.application.get(
        WafBindingKeys.KeyNetworkDriver,
      );
      const authWithOSIdentity = await this.application.get(
        WafBindingKeys.KeyAuthWithOSIdentity,
      );

      await authWithOSIdentity.solveAdminToken();

      let portsParams: PortCreationParams = {
        networkId: reqBody.param.networkId,
        name: 'adcId-',
      };
      let port = await networkDriver.createPort(
        reqBody.param.userToken,
        portsParams,
      );
      return Promise.resolve(port);
    });
  }

  // TODO: implement it.
  // @get('/openstack/portDetail')
  // async getPortDetail(
  //   @requestBody() reqBody: RequestBody): Promise<object> {

  // }

  overrideEnvirons(envs: Environs): Environs {
    let oldEnvs: Environs = {};

    let envlist = [
      'OS_AUTH_URL',
      'OS_USERNAME',
      'OS_PASSWORD',
      'OS_TENANT_ID',
      'OS_DOMAIN_NAME',
      'OS_AVAILABLE_ZONE',
    ];
    for (let n of envlist) {
      oldEnvs[n] = process.env[n];
      process.env[n] = envs[n];
    }
    return oldEnvs;
  }

  async tryRunWithEnvs(
    envs: Environs,
    func: (...args: object[]) => Promise<object>,
    ...args: object[]
  ): Promise<object> {
    const initEnvs = this.overrideEnvirons(envs);
    const funcName = (() => {
      if (!func.name) return '<anonymous>';
      else return func.name;
    })();

    try {
      this.logger.debug('Function: ' + funcName);
      this.logger.debug('Arguments: ' + JSON.stringify(args));

      const rlt = await func(args);
      this.logger.debug('Done: ' + JSON.stringify(rlt));

      return rlt;
    } catch (error) {
      this.logger.debug('Failed: ' + error.message);
      return {
        message: error.message.split('\n'),
        stack: error.stack.split('\n'),
      };
    } finally {
      this.overrideEnvirons(initEnvs);
    }
  }
}
