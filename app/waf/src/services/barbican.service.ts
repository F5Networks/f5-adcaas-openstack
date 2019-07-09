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

import { getService } from '@loopback/service-proxy';
import { inject, Provider, CoreBindings } from '@loopback/core';
import { OpenstackDataSource } from '../datasources';
import { RestApplication } from '@loopback/rest';
import { factory } from '../log4ts';
import { WafBindingKeys } from '../keys';

export interface BarbicanService {
  getSecretDetail(userToken: string, url: string): Promise<object>;
}

export class BarbicanServiceProvider implements Provider<BarbicanService> {
  constructor(
    // openstack must match the name property in the datasource json file
    @inject('datasources.openstack')
    protected dataSource: OpenstackDataSource = new OpenstackDataSource(),
  ) { }

  value(): Promise<BarbicanService> {
    return getService(this.dataSource);
  }
}

export abstract class BarbicanManager {
  protected meta: { version: string } = { version: 'abstract' };

  // @inject('services.BarbicanService')
  protected barbicanService: BarbicanService;

  protected logger = factory.getLogger(
    'barbican.process.BarbicanManager.' + this.meta.version,
  );

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    protected application: RestApplication,
  ) { }

  abstract getSecret(
    userToken: string,
    bbcId: string,
  ): Promise<string>;

  async bindBarbicanService(): Promise<BarbicanManager> {
    // NOTE: define abstract member functions when we plan to do dynamic selection
    // between compute v2 and v3.
    // abstract createVirtualServer(): Promise<object>;
    // abstract queryVSState(serverId: string): Promise<object>;

    // TODO: use bind/inject to use bindComputeService:
    // @inject('services.bindComputeService') works differently within/outside
    // of Controller. It doesn't work outside of Controller. So here we make
    // call to Provider explicitly.
    await new BarbicanServiceProvider().value().then(bbcServ => {
      this.barbicanService = bbcServ;
    });

    return Promise.resolve(this);
  }
}

export class BarbicanManagerV1 extends BarbicanManager {

  async getSecret(
    userToken: string,
    bbcId: string,
  ): Promise<string> {

    let adminToken = await this.application.get(
      WafBindingKeys.KeySolvedAdminToken,
    );

    let url = adminToken.epBarbicanSecret(bbcId);

    return await this.barbicanService
      .getSecretDetail(userToken, url)
      .then(response => {
        return JSON.parse(JSON.stringify(response))['body'];
      });
  }
}
//   // -------------------------------------------------------------------------//

//   async parseDetailResponse(response: object): Promise<ServerDetail> {
//     const serverJson = JSON.parse(JSON.stringify(response))['body'][0][
//       'server'
//     ];

//     let serverDetail: ServerDetail = {
//       addresses: serverJson['addresses'], // TODO: key not exists??
//       createdAt: serverJson['created'],
//       id: serverJson['id'],
//       name: serverJson['name'],
//       powerState: serverJson['OS-EXT-STS:power_state'],
//       tenantId: serverJson['tenant_id'],
//       userId: serverJson['user_id'],
//       vmState: serverJson['OS-EXT-STS:vm_state'], // TODO: OS-EXT-STS:vm_state or state?
//     };

//     return Promise.resolve(serverDetail);
//   }

//   async assembleRequestBody(
//     serversParams: ServersParams,
//   ): Promise<ServersRequestBody> {
//     let serversRequestBody: ServersRequestBody = {
//       server: {
//         flavorRef: serversParams.flavorRef,
//         imageRef: serversParams.imageRef,
//         networks: [{ uuid: '' }],
//         security_groups: [{ name: serversParams.securityGroupName }],
//         name: serversParams.vmName,
//         'OS-DCF:diskConfig': 'AUTO',
//         config_drive: true,
//       },
//     };
//     if (serversParams.availableZoneName)
//       serversRequestBody.server.available_zone =
//         serversParams.availableZoneName;
//     if (serversParams.userData)
//       serversRequestBody.server.user_data = serversParams.userData;

//     serversRequestBody.server.networks.shift();
//     if (serversParams.networkId) {
//       // TODO: remove network uuid support?
//       serversRequestBody.server.networks.push({ uuid: serversParams.networkId });
//     } else if (serversParams.ports) {
//       for (let p of serversParams.ports) {
//         serversRequestBody.server.networks.push({ port: p });
//       }
//     } else throw new Error('Either network uuid or port id should be');
//     return Promise.resolve(serversRequestBody);
//   }
// }

// // TODO: "type": "computev3", -- to support compute v3.
// //export class ComputeManagerV3 extends ComputeManager { }

// class ServersRequestBody {
//   server: {
//     networks: { uuid?: string; port?: string; fixed_ip?: string }[];
//     name: string;

//     imageRef: string;
//     flavorRef: string;
//     available_zone?: string;
//     'OS-DCF:diskConfig': 'AUTO';
//     metadata?: {
//       [key: string]: string;
//     };
//     security_groups: [{ name: string }];

//     user_data?: string;
//     config_drive: boolean;
//   };
// }

// export class ServersParams {
//   userTenantId: string;
//   networkId?: string;
//   ports?: string[];
//   vmName: string;

//   imageRef: string;
//   flavorRef: string;
//   securityGroupName: string;
//   userData?: string;
//   availableZoneName?: string;
//   metadata?: { [key: string]: string };
//   fixedIp?: string;
// }

// export class ServerDetail {
//   vmState: string;
//   powerState: number; // TODO: enum it to string?
//   addresses?: object; // TODO: expends 'object'.
//   createdAt: string;
//   id: string;
//   name: string;
//   tenantId: string;
//   userId: string;
// }
