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
import {CommonEntity, AS3Declaration, Wafpolicy} from '.';

export type as3PolicyActionInsert = {
  name?: string;
  value?: string;
};

export type as3PolicyActionRemove = {
  name?: string;
};

export type as3PolicyActionReplace = {
  name?: string;
  value?: string;
};

export type as3PolicyActionForwardSelect = {
  pool?: string;
  service?: string;
};

@model()
export class Action extends CommonEntity {
  @property({
    type: 'boolean',
    required: false,
    default: true,
  })
  enabled: boolean;

  @property({
    type: 'string',
    required: false,
    default: 'request',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'request',
      openapi: {
        enum: [
          'client-accepted',
          'proxy-request',
          'request',
          'response',
          'server-connected',
        ],
      },
    },
  })
  event: string;

  @property({
    type: 'object',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: {
        name: 'abc',
        value: 'xyz',
      },
      openapi: {
        additionalProperties: false,
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
          value: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
        },
      },
    },
    as3: {},
  })
  insert?: as3PolicyActionInsert;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'http://1.2.3.4/index.html',
    },
    openapi: {
      minLength: 1,
      maxLength: 200,
      format: 'uri',
    },
  })
  location?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: '2d3h896a-2312-40ee-8d08-55550dbc191',
    },
    openapi: {
      format: 'uuid',
    },
    as3: {
      type: 'bigip',
    },
  })
  policy?: string;

  wafpolicy?: Wafpolicy;

  @property({
    type: 'object',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: {
        name: 'abc',
      },
      openapi: {
        additionalProperties: false,
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
        },
      },
    },
    as3: {},
  })
  remove?: as3PolicyActionRemove;

  @property({
    type: 'object',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: {
        name: 'abc',
        value: 'xyz',
      },
      openapi: {
        additionalProperties: false,
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
          value: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
        },
      },
    },
    as3: {},
  })
  replace?: as3PolicyActionReplace;

  @property({
    type: 'object',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: {
        pool: '2d3h896a-2312-40ee-8d08-55550dbc191',
      },
      openapi: {
        additionalProperties: false,
        properties: {
          pool: {
            type: 'string',
            format: 'uuid',
          },
          service: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
    },
    as3: {
      type: 'use',
    },
  })
  select?: as3PolicyActionForwardSelect;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      response: true,
      required: true,
      example: 'httpUri',
    },
    openapi: {
      enum: [
        'http',
        'httpCookie',
        'httpHeader',
        'httpRedirect',
        'httpUri',
        'waf',
        'forward',
        'drop',
        'clientSsl',
        'persist',
      ],
    },
    as3: {},
  })
  type: string;

  @property({
    type: 'string',
    required: true,
    schema: {
      response: true,
      example: '2d3h896a-2312-40ee-8d08-55550dbc191',
    },
  })
  ruleId: string;

  constructor(data?: Partial<Action>) {
    super(data);
  }

  getAS3Declaration(): AS3Declaration {
    let obj = super.getAS3Declaration();

    delete obj.class;
    delete obj.label;
    delete obj.remark;

    return obj;
  }
}
