import {inject, CoreBindings} from '@loopback/core';
import {
  bindingKeyAuthWithOSIdentity,
  bindingKeyComputeManager,
  bindingKeyNetworkDriver,
} from '../../../src/components';
import {
  AuthWithOSIdentity,
  ServersParams,
  ComputeManager,
} from '../../../src/services';
import {
  NetworkDriver,
  PortCreationParams,
} from '../../../src/services/network.service';
import {factory} from '../../../src/log4ts';
import {get, requestBody, RestApplication} from '@loopback/rest';
import {MockBaseController} from '../../helpers/rest.helpers';

class Environs {
  [key: string]: string | undefined;
}

class Parameters {
  // for adminToken
  // none

  // for validateUserToken
  userToken: string;
  tenantName: string;

  // for createVirtualServer
  // userToken
  tenantId: string;
  networkId: string;
  imageRef: string;
  flavorRef: string;
  securityGroupName: string;
  regionName: string;
  vmName: string;

  // for createVirtual Server with port
  portId: string;
  // tenantId: string;
  // imageRef: string;
  // flavorRef: string;
  // securityGroupName: string;
  // regionName: string;
  // vmName: string;

  // for virtualServerDetail
  serverId: string;
  // userToken
  // regionName
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
  }

  @get('/openstack/adminAuthToken')
  async adminAuthToken(@requestBody() reqBody: RequestBody): Promise<object> {
    return this.tryRunWithEnvs(reqBody.env, async () => {
      const authWithOSIdentity = await this.application.get<AuthWithOSIdentity>(
        bindingKeyAuthWithOSIdentity,
      );
      return authWithOSIdentity.adminAuthToken();
    });
  }

  @get('/openstack/validateUserToken')
  async validateUserToken(
    @requestBody() reqBody: RequestBody,
  ): Promise<object> {
    return this.tryRunWithEnvs(reqBody.env, async () => {
      const authWithOSIdentity = await this.application.get<AuthWithOSIdentity>(
        bindingKeyAuthWithOSIdentity,
      );

      return await authWithOSIdentity.adminAuthToken().then(async () => {
        return await authWithOSIdentity.validateUserToken(
          reqBody.param['userToken'],
          reqBody.param['tenantName'],
        );
      });
    });
  }

  @get('/openstack/createVirtualServer')
  async createVirtualServer(
    @requestBody() reqBody: RequestBody,
  ): Promise<object> {
    return this.tryRunWithEnvs(reqBody.env, async () => {
      const authWithOSIdentity = await this.application.get<AuthWithOSIdentity>(
        bindingKeyAuthWithOSIdentity,
      );

      const computeMgr = await this.application.get<ComputeManager>(
        bindingKeyComputeManager,
      );

      let serversParams: ServersParams = {
        userTenantId: reqBody.param.tenantId,
        networkId: reqBody.param.networkId,
        imageRef: reqBody.param.imageRef,
        flavorRef: reqBody.param.flavorRef,
        securityGroupName: reqBody.param.securityGroupName,
        regionName: reqBody.param.regionName,
        vmName: reqBody.param.vmName,
        portId: reqBody.param.portId,
      };

      // Need to generate admin token to retrieve catalog.
      return authWithOSIdentity.adminAuthToken().then(async () => {
        return {
          id: await computeMgr.createVirtualServer(
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
      const authWithOSIdentity = await this.application.get<AuthWithOSIdentity>(
        bindingKeyAuthWithOSIdentity,
      );

      const computeMgr = await this.application.get<ComputeManager>(
        bindingKeyComputeManager,
      );

      return authWithOSIdentity.adminAuthToken().then(() => {
        return computeMgr.virtualServerDetail(
          reqBody.param.userToken,
          reqBody.param.serverId,
          reqBody.param.tenantId,
          reqBody.param.regionName,
        );
      });
    });
  }

  @get('/openstack/createPort')
  async createPort(@requestBody() reqBody: RequestBody): Promise<object> {
    return this.tryRunWithEnvs(reqBody.env, async () => {
      const networkDriver = await this.application.get<NetworkDriver>(
        bindingKeyNetworkDriver,
      );
      const authWithOSIdentity = await this.application.get<AuthWithOSIdentity>(
        bindingKeyAuthWithOSIdentity,
      );

      await authWithOSIdentity.adminAuthToken();
      let networkUrl = await networkDriver.networkEndpoint(
        reqBody.param.regionName,
      );
      let portsParams: PortCreationParams = {
        networkId: reqBody.param.networkId,
        regionName: reqBody.param.regionName,
      };
      let portId = await networkDriver.createPort(
        networkUrl,
        reqBody.param.userToken,
        portsParams,
      );
      return Promise.resolve({id: portId});
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
      'OS_TENANT_NAME',
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
