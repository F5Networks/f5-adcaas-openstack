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
export class ProfileHTTP2Profile extends CommonEntity {
  @property({
    type: 'string',
    required: false,
    default: 'alpn',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'always',
      openapi: {
        enum: ['always', 'alpn'],
      },
    },
    as3: {},
  })
  activationMode: string;

  @property({
    type: 'number',
    required: false,
    default: 10,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 10,
      openapi: {
        type: 'integer',
        minimum: 1,
        maximum: 256,
      },
    },
    as3: {},
  })
  concurrentStreamsPerConnection: number;

  @property({
    type: 'number',
    required: false,
    default: 300,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 300,
      openapi: {
        type: 'integer',
        minimum: 1,
        maximum: 4294967295,
      },
    },
    as3: {},
  })
  connectionIdleTimeout: number;

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
  enforceTlsRequirements: boolean;

  @property({
    type: 'number',
    required: false,
    default: 2048,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 300,
      openapi: {
        type: 'integer',
        minimum: 1024,
        maximum: 16384,
      },
    },
    as3: {},
  })
  frameSize: number;

  @property({
    type: 'number',
    required: false,
    default: 4096,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 300,
      openapi: {
        type: 'integer',
        minimum: 0,
        maximum: 65535,
      },
    },
    as3: {},
  })
  headerTableSize: number;

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
  includeContentLength: boolean;

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
  insertHeader: boolean;

  @property({
    type: 'string',
    required: false,
    default: 'X-HTTP2',
    schema: {
      create: true,
      update: true,
      response: true,
      example: '',
      openapi: {},
    },
    as3: {},
  })
  insertHeaderName: string;

  @property({
    type: 'number',
    required: false,
    default: 32,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 32,
      openapi: {
        type: 'integer',
        minimum: 16,
        maximum: 128,
      },
    },
    as3: {},
  })
  receiveWindow: number;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: '',
      openapi: {
        minLength: 0,
        maxLength: 4096,
      },
    },
    as3: {},
  })
  remark?: string;

  @property({
    type: 'number',
    required: false,
    default: 16384,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 16384,
      openapi: {
        type: 'integer',
        minimum: 2048,
        maximum: 32768,
      },
    },
    as3: {},
  })
  writeSize: number;

  constructor(data?: Partial<ProfileHTTP2Profile>) {
    super(data);
    this.as3Class = 'HTTP2_Profile';
  }
}
