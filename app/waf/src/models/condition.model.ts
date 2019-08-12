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
import {CommonEntity, AS3Declaration} from '.';

export type as3PolicyCompareString = {
  caseSensitive?: boolean;
  operand?: string;
  values: string[];
};

export type as3PolicyCompareNumber = {
  operand?: string;
  values: string[];
};

const as3PolicyCompareStringProps = {
  caseSensitive: {
    type: 'boolean',
  },
  operand: {
    enum: ['equals', 'starts-with', 'ends-with', 'contains'],
  },
  values: {
    type: 'array',
    minItems: 1,
    maxItems: 100,
    items: {
      type: 'string',
      minLength: 1,
      maxLength: 200,
    },
  },
};

const as3PolicyCompareStringShema = {
  create: true,
  update: true,
  response: true,
  example: {},
  openapi: {
    additionalProperties: false,
    properties: as3PolicyCompareStringProps,
  },
};

const as3PolicyCompareNumberProps = {
  operand: {
    enum: ['equals', 'less', 'greater', 'less-or-equal', 'greater-or-equal'],
  },
  values: {
    type: 'array',
    minItems: 1,
    maxItems: 100,
    items: {
      type: 'integer',
    },
  },
};

@model()
export class Condition extends CommonEntity {
  @property({
    type: 'object',
    required: false,
    schema: as3PolicyCompareStringShema,
    as3: {},
  })
  all: as3PolicyCompareString;

  @property({
    type: 'object',
    required: false,
    schema: as3PolicyCompareStringShema,
    as3: {},
  })
  alpn: as3PolicyCompareString;

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
        enum: ['request'],
      },
    },
  })
  event: string;

  @property({
    type: 'object',
    required: false,
    schema: as3PolicyCompareStringShema,
    as3: {},
  })
  extension: as3PolicyCompareString;

  @property({
    type: 'object',
    required: false,
    schema: as3PolicyCompareStringShema,
    as3: {},
  })
  host: as3PolicyCompareString;

  @property({
    type: 'number',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 1,
      openapi: {
        type: 'integer',
        minimum: 1,
      },
    },
    as3: {},
  })
  index: number;

  @property({
    type: 'boolean',
    required: false,
    default: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: false,
    },
    as3: {},
  })
  normalized: boolean;

  @property({
    type: 'object',
    required: false,
    schema: as3PolicyCompareStringShema,
    as3: {},
  })
  npn: as3PolicyCompareString;

  @property({
    type: 'object',
    required: false,
    schema: as3PolicyCompareStringShema,
    as3: {},
  })
  path: as3PolicyCompareString;

  @property({
    type: 'object',
    required: false,
    schema: as3PolicyCompareStringShema,
    as3: {},
  })
  pathSegment: as3PolicyCompareString;

  @property({
    type: 'object',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: {},
      openapi: {
        additionalProperties: false,
        properties: as3PolicyCompareNumberProps,
      },
    },
    as3: {},
  })
  port: as3PolicyCompareNumber;

  @property({
    type: 'object',
    required: false,
    schema: as3PolicyCompareStringShema,
    as3: {},
  })
  queryParameter: as3PolicyCompareString;

  @property({
    type: 'object',
    required: false,
    schema: as3PolicyCompareStringShema,
    as3: {},
  })
  queryString: as3PolicyCompareString;

  @property({
    type: 'object',
    required: false,
    schema: as3PolicyCompareStringShema,
    as3: {},
  })
  scheme: as3PolicyCompareString;

  @property({
    type: 'object',
    required: false,
    schema: as3PolicyCompareStringShema,
    as3: {},
  })
  serverName: as3PolicyCompareString;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      response: true,
      example: 'httpUri',
      openapi: {
        enum: ['httpHeader', 'httpUri', 'httpCookie', 'sslExtension'],
      },
    },
    as3: {},
  })
  type: string;

  @property({
    type: 'object',
    required: false,
    schema: as3PolicyCompareStringShema,
    as3: {},
  })
  unnamedQueryParameter: as3PolicyCompareString;

  @property({
    type: 'string',
    required: true,
    schema: {
      response: true,
      example: '2d3h896a-4d82-4234-8d08-55550dbc191',
    },
  })
  ruleId: string;

  constructor(data?: Partial<Condition>) {
    super(data);
  }

  getAS3Declaration(): AS3Declaration {
    let obj = super.getAS3Declaration();

    obj.name = obj.label;
    delete obj.label;
    return obj;
  }
}
