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
import {CommonEntity} from './common.model';

@model()
export class Monitor extends CommonEntity {
  @property({
    type: 'number',
    default: 5,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 5,
      openapi: {
        type: 'integer',
        minimum: 0,
        maximum: 3600,
      },
    },
  })
  interval: number;

  @property({
    type: 'number',
    default: 16,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 16,
      openapi: {
        type: 'integer',
        minimum: 0,
        maximum: 900,
      },
    },
  })
  timeout: number;

  @property({
    type: 'string',
    default: '',
    schema: {
      create: true,
      update: true,
      response: true,
      example: '192.168.10.123',
      openapi: {
        format: 'ipv4',
      },
    },
  })
  targetAddress: string;

  @property({
    type: 'number',
    default: 0,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 8080,
      openapi: {
        type: 'integer',
        minimum: 0,
        maximum: 65535,
      },
    },
  })
  targetPort: number;

  @property({
    type: 'string',
    required: true,
    default: 'tcp',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'tcp',
      openapi: {
        enum: [
          'dns',
          'external',
          'ftp',
          'http',
          'https',
          'icmp',
          'ldap',
          'radius',
          'sip',
          'smtp',
          'tcp',
          'tcp-half-open',
          'udp',
        ],
      },
    },
    as3: {},
  })
  monitorType: string;

  // user can specify the below attributes to create a certain type monitor
  // TODO: separate the monitors to more specific monitor in future

  @property({
    type: 'string',
    default: 'no-error',
    schema: {
      create: true,
      update: true,
      response: false,
      example: 'no-error',
      openapi: {
        enum: ['anything', 'no-error'],
      },
    },
  })
  acceptRCODE: string;

  @property({
    type: 'boolean',
    default: false,
  })
  adaptive: boolean;

  @property({
    type: 'number',
    default: 500,
    schema: {
      create: true,
      update: true,
      response: false,
      example: 500,
      openapi: {
        type: 'integer',
        minimum: 1,
        maximum: 10000,
      },
    },
  })
  adaptiveDivergenceMilliseconds: number;

  @property({
    type: 'number',
    default: 100,
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        type: 'integer',
        minimum: 1,
        maximum: 500,
      },
    },
  })
  adaptiveDivergencePercentage: number;

  @property({
    type: 'string',
    default: 'relative',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        enum: ['absolute', 'relative'],
      },
    },
  })
  adaptiveDivergenceType: string;

  @property({
    type: 'number',
    default: 1000,
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        type: 'integer',
        minimum: 1,
        maximum: 10000,
      },
    },
  })
  adaptiveLimitMilliseconds: number;

  @property({
    type: 'number',
    default: 180,
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        type: 'integer',
        minimum: 60,
        maximum: 1800,
      },
    },
  })
  adaptiveWindow: number;

  @property({
    type: 'string',
    default: 'query-type',
    schema: {
      create: true,
      update: true,
      response: false,
      example: 'query-type',
      openapi: {
        enum: ['any-type', 'anything', 'query-type'],
      },
    },
  })
  answerContains: string;

  @property({
    type: 'string',
    default: '',
    schema: {
      create: true,
      update: true,
      response: false,
      example: '',
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  arguments: string;

  @property({
    type: 'string',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  base: string;

  @property({
    type: 'boolean',
    default: true,
  })
  chaseReferrals: boolean;

  @property({
    type: 'string',
    default: '',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  ciphers: string;

  @property({
    type: 'string',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  clientCertificate: string;

  @property({
    type: 'array',
    itemType: 'number',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        items: {
          type: 'integer',
          minimum: 0,
        },
      },
    },
  })
  codesDown: number[];

  @property({
    type: 'array',
    itemType: 'number',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        items: {
          type: 'integer',
          minimum: 0,
        },
      },
    },
  })
  codesUp: number[];

  @property({
    type: 'string',
    default: '',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  domain: string;

  @property({
    type: 'number',
    default: 0,
    schema: {
      create: true,
      update: true,
      response: false,
      example: 0,
      openapi: {
        type: 'integer',
        minimum: 0,
        maximum: 63,
      },
    },
  })
  dscp: number;

  @property({
    type: 'boolean',
    default: true,
  })
  expand: boolean;

  @property({
    type: 'string',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  filter: string;

  @property({
    type: 'string',
    default: '',
    schema: {
      create: true,
      update: true,
      response: false,
      example: '',
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  headers: string;

  @property({
    type: 'string',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  label: string;

  @property({
    type: 'boolean',
    default: false,
  })
  mandatoryAttributes: boolean;

  @property({
    type: 'string',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        format: 'ipv4',
      },
    },
  })
  nasIpAddress: string;

  @property({
    type: 'object',
  })
  passphrase: object;

  @property({
    type: 'string',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  pathname: string;

  @property({
    type: 'string',
    default: 'udp',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'udp',
      openapi: {
        enum: ['sips', 'tcp', 'tls', 'udp'],
      },
    },
  })
  protocol: string;

  @property({
    type: 'string',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  queryName: string;

  @property({
    type: 'string',
    default: 'a',
    schema: {
      create: true,
      update: true,
      response: false,
      example: 'a',
      openapi: {
        enum: ['a', 'aaaa'],
      },
    },
  })
  queryType: string;

  @property({
    type: 'string',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  receive: string;

  @property({
    type: 'string',
    default: '',
    schema: {
      create: true,
      update: true,
      response: false,
      example: '',
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  receiveDown: string;

  @property({
    type: 'string',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  remark: string;

  @property({
    type: 'string',
    default: '',
    schema: {
      create: true,
      update: true,
      response: false,
      example: '',
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  request: string;

  @property({
    type: 'boolean',
    default: false,
  })
  reverse: boolean;

  @property({
    type: 'object',
  })
  script: object;

  @property({
    type: 'object',
  })
  secret: object;

  @property({
    type: 'string',
    default: 'none',
    schema: {
      create: true,
      update: true,
      response: false,
      example: 'none',
      openapi: {
        enum: ['none', 'ssl', 'tls'],
      },
    },
  })
  security: string;

  @property({
    type: 'string',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  send: string;

  @property({
    type: 'number',
    default: 0,
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        type: 'integer',
        minimum: 0,
        maximum: 1800,
      },
    },
  })
  timeUntilUp: number;

  @property({
    type: 'boolean',
    default: false,
  })
  transparent: boolean;

  @property({
    type: 'number',
    default: 0,
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        type: 'integer',
        minimum: 0,
        maximum: 3600,
      },
    },
  })
  upInterval: number;

  @property({
    type: 'string',
    schema: {
      create: true,
      update: true,
      response: false,
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
  })
  username: string;

  constructor(data?: Partial<Monitor>) {
    super(data);
    this.as3Class = 'Monitor';
  }
}
