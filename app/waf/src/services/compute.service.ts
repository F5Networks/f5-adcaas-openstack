import {getService} from '@loopback/service-proxy';
import {inject, Provider, CoreBindings} from '@loopback/core';
import {OpenstackDataSource} from '../datasources';
import {RestApplication} from '@loopback/rest';
import {factory} from '../log4ts';
import {WafBindingKeys} from '../keys';

export interface ComputeService {
  v2CreateVirtualServer(
    url: string,
    userToken: string,
    serversRequestBody: object,
  ): Promise<object>;
  v2VirtualServerDetail(url: string, userToken: string): Promise<object>;
}

export class ComputeServiceProvider implements Provider<ComputeService> {
  constructor(
    // openstack must match the name property in the datasource json file
    @inject('datasources.openstack')
    protected dataSource: OpenstackDataSource = new OpenstackDataSource(),
  ) {}

  value(): Promise<ComputeService> {
    return getService(this.dataSource);
  }
}

export abstract class ComputeManager {
  protected meta: {version: string} = {version: 'abstract'};

  // @inject('services.ComputeService')
  protected computeService: ComputeService;

  protected logger = factory.getLogger(
    'compute.process.ComputeManager.' + this.meta.version,
  );

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    protected application: RestApplication,
  ) {}

  abstract createVirtualServer(
    userToken: string,
    serversParams: ServersParams,
  ): Promise<string>;

  abstract virtualServerDetail(
    userToken: string,
    serverId: string,
    tenantId?: string,
    regionName?: string,
  ): Promise<ServerDetail>;

  async bindComputeService(): Promise<ComputeManager> {
    // NOTE: define abstract member functions when we plan to do dynamic selection
    // between compute v2 and v3.
    // abstract createVirtualServer(): Promise<object>;
    // abstract queryVSState(serverId: string): Promise<object>;

    // TODO: use bind/inject to use bindComputeService:
    // @inject('services.bindComputeService') works differently within/outside
    // of Controller. It doesn't work outside of Controller. So here we make
    // call to Provider explicitly.
    await new ComputeServiceProvider().value().then(cmptServ => {
      this.computeService = cmptServ;
    });

    return Promise.resolve(this);
  }
}

export class ComputeManagerV2 extends ComputeManager {
  async createVirtualServer(
    userToken: string,
    serversParams: ServersParams,
  ): Promise<string> {
    try {
      return await Promise.all([
        this.serversEndpoint(
          serversParams.userTenantId,
          serversParams.regionName,
        ),
        this.assembleRequestBody(serversParams),
      ])
        .then(([computeUrl, serversRequestBody]) => {
          return this.computeService.v2CreateVirtualServer(
            computeUrl,
            userToken,
            serversRequestBody,
          );
        })
        .then(serversResponse => {
          const obj = JSON.parse(JSON.stringify(serversResponse))['body'][0];
          this.logger.debug('Created server: ' + JSON.stringify(obj));
          return Promise.resolve(obj['server']['id']);
        });
    } catch (error) {
      let newErr = new Error('Failed to create server.');
      newErr.message += '\n' + error.message;
      newErr.stack += '\n' + error.stack;
      throw newErr;
    }
  }

  async virtualServerDetail(
    userToken: string,
    serverId: string,
    tenantId?: string,
    regionName?: string,
  ): Promise<ServerDetail> {
    if (!tenantId || !regionName)
      throw new Error('tenantId and regionName are required for compute v2.');

    try {
      return await this.serversEndpoint(tenantId, regionName)
        .then(computeUrl => {
          let fullUrl = computeUrl + '/servers/' + serverId;
          return this.computeService.v2VirtualServerDetail(fullUrl, userToken);
        })
        .then(response => {
          return this.parseDetailResponse(response);
        });
    } catch (error) {
      throw new Error('Failed to get virtual server detail.' + error);
    }
  }

  async parseDetailResponse(response: object): Promise<ServerDetail> {
    const serverJson = JSON.parse(JSON.stringify(response))['body'][0][
      'server'
    ];

    let serverDetail: ServerDetail = {
      addresses: serverJson['addresss'], // TODO: key not exists??
      createdAt: serverJson['created'],
      id: serverJson['id'],
      name: serverJson['name'],
      powerState: serverJson['OS-EXT-STS:power_state'],
      tenantId: serverJson['tenant_id'],
      userId: serverJson['user_id'],
      vmState: serverJson['OS-EXT-STS:vm_state'], // TODO: OS-EXT-STS:vm_state or state?
    };

    return Promise.resolve(serverDetail);
  }

  async serversEndpoint(
    userTenantId: string,
    regionName: string,
  ): Promise<string> {
    let endpoint: string | undefined;
    try {
      await this.application
        .get(WafBindingKeys.KeyAdminAuthedToken)
        .then(adminToken => {
          endpoint = (() => {
            for (let c of adminToken.catalog) {
              if (c.type !== 'compute') continue;

              for (let e of c.endpoints) {
                let eJson = JSON.parse(JSON.stringify(e));
                if (eJson['region'] !== regionName) continue;
                let url = <string>eJson['internalURL'];
                return url.slice(0, url.lastIndexOf('/')) + '/' + userTenantId;
              }
            }

            throw new Error('Not found the endpoint.');
          })();
        });
    } catch (error) {
      let newErr = new Error(
        'Failed to get compute endpoint from admin token.',
      );
      newErr.message += '\n' + error.message;
      newErr.stack += '\n' + error.stack;
      throw newErr;
    }

    if (!endpoint) throw new Error('Not found compute url.');
    return Promise.resolve(endpoint);
  }

  async assembleRequestBody(
    serversParams: ServersParams,
  ): Promise<ServersRequestBody> {
    let serversRequestBody: ServersRequestBody = {
      server: {
        flavorRef: serversParams.flavorRef,
        imageRef: serversParams.imageRef,
        networks: [{uuid: ''}],
        security_groups: [{name: serversParams.securityGroupName}],
        name: serversParams.vmName,
        'OS-DCF:diskConfig': 'AUTO',
      },
    };
    if (serversParams.availableZoneName)
      serversRequestBody.server.available_zone =
        serversParams.availableZoneName;
    if (serversParams.userData)
      serversRequestBody.server.userData = serversParams.userData;
    if (serversParams.networkId) {
      // TODO: support multiple networks/ports.
      serversRequestBody.server.networks[0].uuid = serversParams.networkId;
    } else if (serversParams.portId) {
      delete serversRequestBody.server.networks[0].uuid;
      serversRequestBody.server.networks[0].port = <string>serversParams.portId;
      // if (serversParams.fixedIp) // TODO: support fixed ip.
    }

    return Promise.resolve(serversRequestBody);
  }
}

// TODO: "type": "computev3", -- to support compute v3.
//export class ComputeManagerV3 extends ComputeManager { }

class ServersRequestBody {
  server: {
    networks: [{uuid?: string; port?: string; fixed_ip?: string}];
    name: string;

    imageRef: string;
    flavorRef: string;
    available_zone?: string;
    'OS-DCF:diskConfig': 'AUTO';
    metadata?: {
      [key: string]: string;
    };
    security_groups: [{name: string}];

    userData?: string;
  };
}

export class ServersParams {
  userTenantId: string;
  networkId: string;
  vmName: string;

  imageRef: string;
  flavorRef: string;
  securityGroupName: string;
  userData?: string;
  regionName: string;
  availableZoneName?: string;
  metadata?: {[key: string]: string};
  portId?: string;
  fixedIp?: string;
}

export class ServerDetail {
  vmState: string;
  powerState: number; // TODO: enum it to string?
  addresses?: object; // TODO: expends 'object'.
  createdAt: string;
  id: string;
  name: string;
  tenantId: string;
  userId: string;
}
