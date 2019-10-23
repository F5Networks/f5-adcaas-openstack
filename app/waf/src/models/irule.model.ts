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
export class IRule extends CommonEntity {
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
  expand: boolean;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'when CLIENT_ACCEPTED {\n}\n',
      openapi: {
        minLength: 0,
        maxLength: 65536,
      },
    },
    as3: {},
  })
  iRule: string;

  @property({
    type: 'string',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'iRule_name',
      openapi: {
        minLength: 1,
        maxLength: 100,
      },
    },
    as3: {},
  })
  label?: string;

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

  constructor(data?: Partial<IRule>) {
    super(data);
    this.as3Class = 'iRule';
  }
}
