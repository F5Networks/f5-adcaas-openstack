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

import {model, property, Entity} from '@loopback/repository';
import {CommonEntity} from '.';

export type ConfigTypes = {
  type: string;
  //platformType: 'OpenStack';
  networks: {
    [key: string]: {
      type: 'mgmt' | 'ext' | 'int' | 'ha';
      networkId: string;
      fixedIp?: string;
      //vips?: [string]; // cannot be appointed.
      floatingIp?: string;
    };
  };
  compute: {
    imageRef: string;
    flavorRef: string;
    userData?: string;
    sshKey?: string;
  };
  //floatingNetworkId?: string;
  securityGroup?: [string];
  management: {
    // cannot be appointed.
    connection?: {
      ipAddress: string; // mostly floatingIp.
      tcpPort: number;
      username: string;
      password: string;
      rootPass: string;
    };
    vmId?: string; // cannot be appointed.
    networks: {
      [key: string]: {
        fixedIp?: string;
        macAddr?: string;
        //floatingIp?: string;
        portId?: string; // cannot be appointed.
        floatingIp?: string;
        floatingIpId?: string;
        floatingIpCreated?: boolean;
      };
    };
    trustedDeviceId?: string;
  };
  status: string; // cannot be appointed.
  lastErr: string; // cannot be appointed.
};

@model()
export class Adc extends CommonEntity {
  @property({
    type: 'string',
    required: true,
    default: 'VE',
    schema: {
      create: true,
      response: true,
      required: true,
      example: 'VE',
      openapi: {
        // modify this list when deleting HW path
        enum: ['VE', 'HW'],
      },
    },
  })
  type: string;

  @property({
    type: 'object',
    required: true,
    schema: {
      create: true,
      response: true,
      example: {
        mgmt1: {
          type: 'mgmt',
          networkId: '80ccb4f0-5a9f-11e9-9721-3b33816a88bd',
          fixedIp: '172.16.11.100',
        },
        failover1: {
          type: 'ha',
          networkId: 'b1d0a920-5aa0-11e9-9721-3b33816a88bd',
        },
        internal1: {
          type: 'int',
          networkId: 'ba6e2a80-5aa0-11e9-9721-3b33816a88bd',
        },
        external2: {
          type: 'ext',
          networkId: 'c25eca10-5aa0-11e9-9721-3b33816a88bd',
          floatingIp: '10.250.14.160',
        },
      },
      openapi: {
        additionalProperties: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['mgmt', 'ha', 'int', 'ext'],
            },
            networkId: {
              type: 'string',
              format: 'uuid',
            },
            fixedIp: {
              type: 'string',
              format: 'ipv4',
            },
            floatingIp: {
              type: 'string',
              format: 'ipv4',
            },
          },
          required: ['type', 'networkId'],
          additionalProperties: false,
        },
        minProperties: 4,
        maxProperties: 100,
      },
    },
  })
  networks: ConfigTypes['networks'];

  @property({
    type: 'object',
    required: true,
    schema: {
      create: true,
      required: true,
      response: true,
      example: {
        imageRef: 'd4c52d70-5aa0-11e9-9721-3b33816a88bd',
        flavorRef: 'ff29d6b0-5aa0-11e9-9721-3b33816a88bd',
        userData: '#!/bin/bash \necho userData is optional \n',
      },
      openapi: {
        properties: {
          imageRef: {
            type: 'string',
            format: 'uuid',
          },
          flavorRef: {
            type: 'string',
            // format: 'uuid',
            minLength: 1,
            maxLength: 100,
          },
          sshKey: {
            type: 'string',
            minLength: 1,
            maxLength: 10000,
          },
          userData: {
            type: 'string',
            minLength: 1,
          },
        },
        additionalProperties: false,
        required: ['imageRef', 'flavorRef'],
      },
    },
  })
  compute: ConfigTypes['compute'];

  @property({
    type: 'object',
    schema: {
      response: true,
    },
  })
  management: ConfigTypes['management'];

  @property({
    type: 'string',
    schema: {
      response: true,
    },
  })
  license?: string;

  @property({
    type: 'string',
    required: true,
    default: 'NEW',
    schema: {
      response: true,
    },
  })
  status: ConfigTypes['status'];

  @property({
    type: 'string',
    required: false,
    default: '',
    schema: {
      response: true,
    },
  })
  lastErr: ConfigTypes['lastErr'];

  constructor(data?: Partial<Adc>) {
    super(data);
  }

  getBasicAuth(): string {
    return Buffer.from(
      `${this.management.connection!.username}:${
        this.management.connection!.password
      }`,
    ).toString('base64');
  }

  getDoEndpoint(): string {
    return `https://${this.management.connection!.ipAddress}:${
      this.management.connection!.tcpPort
    }`;
  }
}

export class ActionsResponse extends Entity {
  @property({
    type: 'string',
    required: true,
    schema: {
      response: true,
      example: '11111111-2222-3333-4444-555555555555',
    },
  })
  id: string;
}
