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
import {CommonEntity} from '../common.model';

@model()
export class ProfileHTTPCompression extends CommonEntity {
  @property({
    type: 'boolean',
    required: false,
    default: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: true,
    },
    as3: {},
  })
  allowHTTP10: boolean;

  @property({
    type: 'number',
    required: false,
    default: 4096,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 4096,
      openapi: {
        type: 'integer',
        minimum: 256,
        maximum: 32768,
      },
    },
    as3: {},
  })
  bufferSize: number;

  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    default: [],
    schema: {
      create: true,
      update: true,
      response: true,
      example: ['application/json', 'text/xml'],
      openapi: {
        items: {
          type: 'string',
          maxLength: 64,
        },
      },
    },
    as3: {},
  })
  contentTypeExcludes: string[];

  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    default: ['text/', 'application/(xml|x-javascript)'],
    schema: {
      create: true,
      update: true,
      response: true,
      example: ['application/json', 'text/xml'],
      openapi: {
        items: {
          type: 'string',
          maxLength: 64,
        },
      },
    },
    as3: {},
  })
  contentTypeIncludes: string[];

  @property({
    type: 'boolean',
    required: false,
    default: true,
    schema: {
      create: true,
      update: true,
      response: true,
      example: true,
    },
    as3: {},
  })
  cpuSaver: boolean;

  @property({
    type: 'number',
    required: false,
    default: 90,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 90,
      openapi: {
        type: 'integer',
        minimum: 15,
        maximum: 99,
      },
    },
    as3: {},
  })
  cpuSaverHigh: number;

  @property({
    type: 'number',
    required: false,
    default: 75,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 75,
      openapi: {
        type: 'integer',
        minimum: 10,
        maximum: 95,
      },
    },
    as3: {},
  })
  cpuSaverLow: number;

  @property({
    type: 'number',
    required: false,
    default: 1,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 1,
      openapi: {
        type: 'integer',
        minimum: 1,
        maximum: 9,
      },
    },
    as3: {},
  })
  gzipLevel: number;

  @property({
    type: 'number',
    required: false,
    default: 8,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 8,
      openapi: {
        type: 'integer',
        minimum: 1,
        maximum: 256,
      },
    },
    as3: {},
  })
  gzipMemory: number;

  @property({
    type: 'number',
    required: false,
    default: 16,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 16,
      openapi: {
        type: 'integer',
        minimum: 1,
        maximum: 128,
      },
    },
    as3: {},
  })
  gzipWindowSize: number;

  @property({
    type: 'boolean',
    required: false,
    default: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: true,
    },
    as3: {},
  })
  keepAcceptEncoding: boolean;

  @property({
    type: 'string',
    schema: {
      create: true,
      update: true,
      response: true,
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
    as3: {},
  })
  label?: string;

  @property({
    type: 'number',
    required: false,
    default: 1024,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 1024,
      openapi: {
        type: 'integer',
        minimum: 128,
        maximum: 131072,
      },
    },
    as3: {},
  })
  minimumSize: number;

  @property({
    type: 'string',
    required: false,
    default: 'gzip',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'gzip',
      openapi: {
        enum: ['gzip', 'deflate'],
      },
    },
    as3: {},
  })
  preferMethod: string;

  @property({
    type: 'string',
    required: false,
    default: '',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'any string',
      openapi: {
        minLength: 0,
        maxLength: 4096,
      },
    },
    as3: {},
  })
  remark: string;

  @property({
    type: 'boolean',
    required: false,
    default: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: true,
    },
    as3: {},
  })
  selective: boolean;

  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    default: [],
    schema: {
      create: true,
      update: true,
      response: true,
      example: ['http://example.org'],
      openapi: {
        items: {
          type: 'string',
          format: 'uri',
          maxLength: 1024,
        },
      },
    },
    as3: {},
  })
  uriExcludes: string[];

  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    default: [],
    schema: {
      create: true,
      update: true,
      response: true,
      example: ['http://example.org'],
      openapi: {
        items: {
          type: 'string',
          format: 'uri',
          maxLength: 1024,
        },
      },
    },
    as3: {},
  })
  uriIncludes: string[];

  @property({
    type: 'boolean',
    required: false,
    default: true,
    schema: {
      create: true,
      update: true,
      response: true,
      example: true,
    },
    as3: {},
  })
  varyHeader: boolean;

  constructor(data?: Partial<ProfileHTTPCompression>) {
    super(data);
    this.as3Class = 'HTTP_Compress';
  }
}
