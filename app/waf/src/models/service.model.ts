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

import {model, property} from '@loopback/repository';
import {CommonEntity, AS3Declaration, Pool, Endpointpolicy} from '.';

@model()
export class Service extends CommonEntity {
  @property({
    type: 'string',
    required: true,
    schema: {
      create: true,
      update: false,
      response: true,
      required: true,
      example: 'HTTP',
      openapi: {
        enum: ['HTTP', 'HTTPS'],
        //TODO: add L4, TCP and UDP to enum list.
      },
    },
  })
  type: string;

  @property({
    type: 'string',
    required: true,
    schema: {
      create: true,
      update: false,
      required: true,
      response: true,
      example: '11111111-2222-3333-4444-555555555555',
      openapi: {
        format: 'uuid',
      },
    },
  })
  applicationId: string;

  @property({
    type: 'boolean',
    required: false,
    default: true,
    schema: {
      create: false,
      update: false,
    },
  })
  addressStatus: boolean;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
    },
    as3: {
      type: 'bigip',
    },
  })
  clientTLS?: string;

  @property({
    type: 'object',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  clonePools?: object;

  @property({
    type: 'boolean',
    required: false,
    default: true,
    schema: {
      create: false,
      update: false,
    },
  })
  enable: boolean;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  fallbackPersistenceMethod?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  lastHop?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  layer4?: string;

  @property({
    type: 'number',
    required: false,
    default: 0,
    schema: {
      create: false,
      update: false,
    },
  })
  maxConnections: number;

  @property({
    type: 'object',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  metadata: object;

  @property({
    type: 'string',
    required: false,
  })
  mirroring?: string;

  @property({
    type: 'boolean',
    required: false,
    schema: {
      response: true,
    },
    as3: {
      type: '',
    },
  })
  // TODO: "nat64Enabled": true, reports as following, need to confirm with AS3 team.
  // "code": 422,
  // "message": "Invalid data property: nat64Enabled",
  nat64Enabled?: boolean;

  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  persistenceMethods?: string[];

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  policyFirewallEnforced?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  policyFirewallStaged?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  policyIAM?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  policyNAT?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: '11111111-2222-3333-4444-555555555555',
    },
    as3: {
      property: 'pool',
      type: 'name',
    },
  })
  defaultPoolId?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
    },
  })
  profileAnalytics?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileClassification?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
    },
    as3: {
      type: 'bigip',
    },
  })
  profileConnectivity?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileDiameterEndpoint?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileDNS?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileDOS?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileEnforcement?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileFIX?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileFTP?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileHTTP?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
    },
    as3: {
      type: 'bigip',
    },
  })
  /**
   *
   "statusCode": 422,
   "name": "UnprocessableEntityError",
   "message": Deployment is something wrong: "Invalid data property: profileHTTP2"
   */
  profileHTTP2?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileHTTPAcceleration?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
    },
    as3: {
      type: 'extends',
    },
  })
  profileHTTPCompression?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileIPOther?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileMultiplex?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileL4?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileRADIUS?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileRewrite?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileSIP?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileSubscriberManagement?: string;

  @property({
    type: 'object',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileTCP?: object;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileTrafficLog?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  profileUDP?: string;

  @property({
    type: 'boolean',
    required: false,
    default: true,
    schema: {
      create: false,
      update: false,
    },
  })
  redirect80?: boolean;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
    },
    as3: {
      type: 'bigip',
    },
  })
  serverTLS?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
    },
  })
  snat?: string;

  @property({
    type: 'boolean',
    required: false,
    default: false,
    schema: {
      create: false,
      update: false,
    },
  })
  translateClientPort: boolean;

  @property({
    type: 'boolean',
    required: false,
    default: true,
    schema: {
      create: false,
      update: false,
    },
  })
  translateServerAddress: boolean;

  @property({
    type: 'boolean',
    required: false,
    default: true,
    schema: {
      create: false,
      update: false,
    },
  })
  translateServerPort: boolean;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
    schema: {
      create: true,
      update: false,
      required: true,
      response: true,
      example: ['10.100.0.1'],
      openapi: {
        items: {
          type: 'string',
          format: 'ipv4',
        },
        minItems: 1,
        maxItems: 1,
      },
    },
    as3: {},
  })
  virtualAddresses: string[];

  @property({
    type: 'number',
    required: false,
    default: 80,
    schema: {
      create: true,
      update: false,
      response: true,
      example: '80',
      openapi: {
        type: 'integer',
        minimum: 0,
        maximum: 65535,
      },
    },
    as3: {},
  })
  virtualPort: number;

  defaultPool?: Pool;
  policies: Endpointpolicy[] = [];

  // TODO: what's more, divide different types of Services into different model definition to avoid such long definition.

  //TODO: many-to-many relation to other objects
  // iRules
  // allowVlans
  // nat64Enabled
  // policyEndpoint
  // profileAccess
  // profileAnalyticsTcp
  // profileConnectivity
  // profileFPS
  // profileHTTP2
  // profileSSHProxy
  // profileStream
  // rejectVlans
  // securityLogProfiles

  constructor(data?: Partial<Service>) {
    super(data);
  }

  getAS3Class(): string {
    return 'Service_' + this.type;
  }

  getAS3Declaration(): AS3Declaration {
    let obj = super.getAS3Declaration();

    obj.policyEndpoint = this.policies.map(policy => policy.getAS3Name());

    return obj;
  }
}
