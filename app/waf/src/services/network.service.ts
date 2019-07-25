/**
 * Copyright 2019 F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {getService} from '@loopback/service-proxy';
import {inject, Provider, CoreBindings, Application} from '@loopback/core';
import {OpenstackDataSource} from '../datasources';
import {factory} from '../log4ts';
import {AuthedToken} from './identity.service';

export interface NetworkService {
  v2CreatePort(
    url: string,
    userToken: string,
    body: PortsCreateRequest,
  ): Promise<object>;
  v2UpdatePort(
    url: string,
    userToken: string,
    body: PortUpdateRequest,
  ): Promise<object>;
  v2GetSubnets(url: string, userToken: string): Promise<object>;
  v2GetPorts(url: string, userToken: string): Promise<object>;
  v2DeletePort(url: string, userToken: string): Promise<object>;

  getInfo(url: string, headers: object): Promise<object>;
  putInfo(url: string, headers: object, body: object): Promise<object>;
  postInfo(url: string, headers: object, body: object): Promise<object>;
  deleteInfo(url: string, headers: object): Promise<object>;
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

  private floatingIpNetworkId: string | undefined;
  protected logger = factory.getLogger(
    'Unknown: compute.process.NetworkDriver.' + this.meta.version,
  );

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    protected application: Application,
  ) {
    this.floatingIpNetworkId = process.env.OS_FLOATINGIP_NETWORK_ID;
  }

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
    userToken: AuthedToken,
    portParams: PortCreationParams,
  ): Promise<PortResponse> {
    let url = userToken.epPorts();

    let body: PortsCreateRequest = {
      port: {
        network_id: portParams.networkId,
        port_security_enabled: false,
      },
    };
    if (portParams.fixedIp) {
      body.port.fixed_ips = [{ip_address: portParams.fixedIp}];
    }

    body.port.name = 'f5-' + portParams.name;

    return await this.networkService
      .v2CreatePort(url, userToken.token, body)
      .then(response => {
        const respJson = JSON.parse(JSON.stringify(response))['body'][0];
        const portResp: PortResponse = {
          id: respJson['port']['id'],
          fixedIp: respJson['port']['fixed_ips'][0]['ip_address'],
          macAddr: respJson['port']['mac_address'],
        };
        return portResp;
      });
  }

  async updatePort(
    userToken: AuthedToken,
    portParams: PortsUpdateParams,
  ): Promise<void> {
    let url = userToken.epPorts() + `/${portParams.id}`;

    let body: PortUpdateRequest = {port: {}};
    if (portParams.fixedIps) {
      body.port.fixed_ips = portParams.fixedIps!;
    }

    await this.networkService.v2UpdatePort(url, userToken.token, body);
  }

  async deletePort(userToken: AuthedToken, portId: string): Promise<void> {
    let url = userToken.epPorts() + `/${portId}`;
    await this.networkService.v2DeletePort(url, userToken.token);
  }

  async getSubnetInfo(
    userToken: AuthedToken,
    networkId: string,
  ): Promise<SubnetInfo[]> {
    let url = userToken.epSubnets() + '?network_id=' + networkId;
    return await this.networkService
      .v2GetSubnets(url, userToken.token)
      .then(response => {
        this.logger.debug(
          'access ' + url + ' response: ' + JSON.stringify(response),
        );
        let resp = JSON.parse(JSON.stringify(response))['body'][0]['subnets'];
        let rlt: SubnetInfo[] = [];
        for (let n of resp) {
          let s: SubnetInfo = {
            gatewayIp: n.gateway_ip,
            subnetId: n.id,
            networkId: n.network_id,
            cidr: n.cidr,
            ipVersion: n.ip_version,
          };
          rlt.push(s);
        }
        return rlt;
      });
  }

  async getPortInfo(userToken: AuthedToken, portId: string): Promise<Port> {
    let url = userToken.epPorts() + '/' + portId;
    let response = await this.networkService.v2GetPorts(url, userToken.token);

    this.logger.debug(
      'access ' + url + ' response: ' + JSON.stringify(response),
    );
    let portObj = JSON.parse(JSON.stringify(response))['body'][0]['port'];

    let portRtn: Port = {
      fixedIps: portObj.fixed_ips,
      id: portObj.id,
      networkId: portObj.network_id,
    };

    return portRtn;
  }

  async getFloatingIps(
    userToken: AuthedToken,
    ipAddress?: string,
  ): Promise<FloatingIP[]> {
    let url =
      userToken.epFloatingIps() +
      (ipAddress ? `?floating_ip_address=${ipAddress}` : '');
    let headers = {
      'X-Auth-Token': userToken,
      'content-type': 'application/json',
    };
    let response = await this.networkService.getInfo(url, headers);

    this.logger.debug(
      'access ' + url + ' response: ' + JSON.stringify(response),
    );

    let fipsObj = JSON.parse(JSON.stringify(response))['body'][0][
      'floatingips'
    ];

    let fips: FloatingIP[] = [];
    for (let fip of fipsObj) {
      let f: FloatingIP = {
        id: fip.id,
        fixed_ip_address: fip.fixed_ip_address,
        port_id: fip.port_id,
        status: fip.status,
        tenant_id: fip.tenant_id,
      };
      fips.push(f);
    }

    return fips;
  }

  // TODO: redefine the function whenn userToken is AuthedToken.
  async createFloatingIp(
    userToken: AuthedToken,
    tenantId: string,
    ipAddress?: string,
    portId?: string,
  ): Promise<FloatingIP> {
    let url = userToken.epFloatingIps();
    let headers = {
      'X-Auth-Token': userToken,
      'content-type': 'application/json',
    };
    let body: object = {
      floatingip: {
        floating_network_id: this.floatingIpNetworkId,
        tenant_id: tenantId,
        project_id: tenantId,
      },
    };

    // @ts-ignore body.floatingip may have floating_ip_address key.
    if (ipAddress) body.floatingip.floating_ip_address = ipAddress;
    // @ts-ignore body.floatingip may have port_id key.
    if (portId) body.floatingip.port_id = portId;

    let response = await this.networkService.postInfo(url, headers, body);
    this.logger.debug(
      'access ' + url + ' response: ' + JSON.stringify(response),
    );
    let fip = JSON.parse(JSON.stringify(response))['body'][0]['floatingip'];

    return {
      id: fip.id,
      fixed_ip_address: fip.fixed_ip_address,
      port_id: fip.port_id,
      status: fip.status,
      tenant_id: fip.tenant_id,
    };
  }

  async bindFloatingIpToPort(
    userToken: AuthedToken,
    floatingIpId: string,
    portId: string,
  ): Promise<FloatingIP> {
    let url = userToken.epFloatingIps() + `/${floatingIpId}`;
    let headers = {
      'X-Auth-Token': userToken,
      'content-type': 'application/json',
    };
    let body: object = {
      floatingip: {
        port_id: portId,
      },
    };

    let response = await this.networkService.putInfo(url, headers, body);

    this.logger.debug(
      'access ' + url + ' response: ' + JSON.stringify(response),
    );

    let fip = JSON.parse(JSON.stringify(response))['body'][0]['floatingip'];

    return {
      id: fip.id,
      fixed_ip_address: fip.fixed_ip_address,
      port_id: fip.port_id,
      status: fip.status,
      tenant_id: fip.tenant_id,
    };
  }

  async deleteFloatingIp(
    userToken: AuthedToken,
    floatingIpId: string,
  ): Promise<void> {
    let url = userToken.epFloatingIps() + `/${floatingIpId}`;
    let headers = {
      'X-Auth-Token': userToken,
      'content-type': 'application/json',
    };

    let response = await this.networkService.deleteInfo(url, headers);
    this.logger.debug(
      'access ' + url + ' response: ' + JSON.stringify(response),
    );
  }
  async updateLogger(reqId: string): Promise<NetworkDriver> {
    this.logger = factory.getLogger(
      reqId + ': compute.process.NetworkDriver.' + this.meta.version,
    );
    return this;
  }
}

type PortsCreateRequest = {
  port: {
    network_id: string;
    port_security_enabled: boolean;
    name?: string;
    admin_state_up?: boolean;
    tenant_id?: string;
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

type PortUpdateRequest = {
  port: {
    fixed_ips?: {
      ip_address?: string;
      subnet_id?: string;
    }[];
  };
};

export class PortCreationParams {
  networkId: string;
  fixedIp?: string;
  name: string;
}

// TODO: combine PortCreationParams and PortUpdateParams?
export type PortsUpdateParams = {
  id: string;
  fixedIps?: {
    ip_address?: string;
    subnet_id?: string;
  }[];
  //...
};

export type PortResponse = {
  id: string;
  fixedIp: string;
  macAddr: string;
};

export type FixedIP = {
  ip_address: string;
  subnet_id: string;
};

export type FloatingIP = {
  id: string;
  tenant_id: string;
  fixed_ip_address: string;
  port_id?: string;
  status: 'DOWN' | 'ACTIVE';
};

// TODO: remove this type, and merge it into PortsCreateParam or ..
export type Port = {
  id: string;
  networkId: string;
  fixedIps: FixedIP[];
};

export type PortsResponse = Port[];

export type SubnetInfo = {
  gatewayIp: string;
  subnetId: string;
  networkId: string;
  ipVersion: number;
  cidr: string;
};
