import {getService} from '@loopback/service-proxy';
import {inject, Provider, CoreBindings, Application} from '@loopback/core';
import {OpenstackDataSource} from '../datasources';
import {factory} from '../log4ts';
import {WafBindingKeys} from '../keys';

export interface NetworkService {
  v2CreatePort(
    url: string,
    userToken: string,
    body: PortsRequest,
  ): Promise<object>;
  v2GetSubnets(url: string, userToken: string): Promise<object>;
}

export class NetworkServiceProvider implements Provider<NetworkService> {
  constructor(
    // openstack must match the name property in the datasource json file
    @inject('datasources.openstack')
    protected dataSource: OpenstackDataSource = new OpenstackDataSource(),
  ) {}

  value(): Promise<NetworkService> {
    return getService(this.dataSource);
  }
}

export class NetworkDriver {
  protected meta: {version: string} = {version: 'v2.0'};

  // @inject('services.ComputeService')
  protected networkService: NetworkService;

  protected logger = factory.getLogger(
    'compute.process.NetworkDriver.' + this.meta.version,
  );

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    protected application: Application,
  ) {}

  async bindNetworkService(): Promise<NetworkDriver> {
    // TODO: use bind/inject to use bindComputeService:
    // @inject('services.bindComputeService') works differently within/outside
    // of Controller. It doesn't work outside of Controller. So here we make
    // call to Provider explicitly.
    await new NetworkServiceProvider().value().then(netServ => {
      this.networkService = netServ;
    });
    return Promise.resolve(this);
  }

  async createPort(
    userToken: string,
    portParams: PortCreationParams,
  ): Promise<PortResponse> {
    try {
      // TODO: exception check.
      return await this.networkEndpoint(portParams.regionName)
        .then(async networkUrl => {
          let url = networkUrl + '/v2.0/ports';
          let body: PortsRequest = {
            port: {
              network_id: portParams.networkId,
            },
          };

          if (portParams.fixedIp) {
            body.port.fixed_ips = [{ip_address: portParams.fixedIp}];
          }

          body.port.name = 'f5-' + portParams.name;

          return this.networkService.v2CreatePort(url, userToken, body);
        })
        .then(response => {
          const respJson = JSON.parse(JSON.stringify(response))['body'][0];
          const portResp: PortResponse = {
            id: respJson['port']['id'],
            fixedIp: respJson['port']['fixed_ips'][0]['ip_address'],
          };
          return portResp;
        });
    } catch (error) {
      throw new Error('Failed to create port: ' + error);
    }
  }

  async networkEndpoint(regionName: string = 'RegionOne'): Promise<string> {
    let endpoint: string | undefined;
    try {
      await this.application
        .get(WafBindingKeys.KeyAdminAuthedToken)
        .then(adminToken => {
          endpoint = (() => {
            for (let c of adminToken.catalog) {
              if (c.type !== 'network') continue;

              for (let e of c.endpoints) {
                let eJson = JSON.parse(JSON.stringify(e));
                if (eJson['region'] !== regionName) continue;

                return <string>eJson['internalURL'];
              }
            }
            throw new Error('Not found the endpoint.');
          })();
        });
    } catch (error) {
      throw new Error(
        'Failed to get compute endpoint from admin token.' + error,
      );
    }

    if (!endpoint) throw new Error('Not found compute url.');
    return Promise.resolve(endpoint);
  }

  async getSubnetIds(userToken: string, networkId: string): Promise<[string]> {
    let url =
      (await this.networkEndpoint()) + '/v2.0/subnets?network_id=' + networkId;
    return await this.networkService
      .v2GetSubnets(url, userToken)
      .then(response => {
        this.logger.debug(
          'access ' + url + ' response: ' + JSON.stringify(response),
        );
        let resp = JSON.parse(JSON.stringify(response))['subnets'];
        return resp.map((v: {[key: string]: string}) => {
          return v.id;
        });
      });
  }

  //async createFloatingIp() { }
}

type PortsRequest = {
  port: {
    network_id: string;
    name?: string;
    admin_state_up?: boolean;
    tenent_id?: string;
    mac_address?: string;
    fixed_ips?: {
      ip_address?: string;
      subnet_id?: string;
    }[];
    'binding:vnic_type'?:
      | 'normal'
      | 'macvtap'
      | 'direct'
      | 'baremetal'
      | 'direct-physical'
      | 'virtio-forwarder'
      | 'smart-nic';
    allowed_address_pairs?: object[]; // TODO: investigate it for what it does do.
  };
};

export class PortCreationParams {
  networkId: string;
  regionName?: string = 'RegionOne';
  fixedIp?: string;
  name: string;
}

export type PortResponse = {
  id: string;
  fixedIp: string;
};
