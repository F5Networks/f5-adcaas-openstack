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

import { CommonEntity, Certificate } from '.';
import { model, property } from '@loopback/repository';

@model()
export class TLSServer extends CommonEntity {
  @property({
    type: 'boolean',
    required: false,
    default: false,
    schema: {
      create: false,
      update: false,
      response: true,
      example: true,
    },
  })
  allowExpiredCRL: boolean;

  @property({
    type: 'string',
    required: false,
    default: 'one-time',
    schema: {
      create: false,
      update: false,
      response: true,
      example: 'one-time',
    },
  })
  authenticationFrequency: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
      response: true,
    },
  })
  authenticationInviteCA: string;

  @property({
    type: 'string',
    required: false,
    default: 'ignore',
    schema: {
      create: false,
      update: false,
      response: true,
      example: 'ignore',
    },
  })
  authenticationMode: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
      response: true,
    },
  })
  authenticationTrustCA: string;

  @property({
    type: 'boolean',
    required: false,
    schema: {
      create: false,
      update: false,
      response: true,
      example: false
    },
  })
  c3dEnabled: false;

  @property({
    type: 'object',
    required: false,
    schema: {
      create: false,
      update: false,
      response: true
    },
  })
  c3dOCSP: object

  @property({
    type: 'string',
    required: false,
    default: 'drop',
    schema: {
      create: false,
      update: false,
      response: true,
      example: 'drop',
    },
  })
  c3dOCSPUnknownStatusAction: string;

  @property({
    type: 'object',
    required: false,
    schema: {
      create: false,
      update: false,
      response: true,
    },
  })
  certificates: TLSServerCertificate[];

  @property({
    type: 'string',
    required: false,
    default: 'DEFAULT',
    schema: {
      create: false,
      update: false,
      response: true,
      example: 'DEFAULT',
    },
  })
  ciphers: string;

  @property({
    type: 'object',
    required: false,
    schema: {
      create: false,
      update: false,
      response: true,
    },
  })
  crlFile: object;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: false,
      update: false,
      response: true,
      example: 'none',
    },
  })
  ldapStartTLS: string;

  @property({
    type: 'boolean',
    required: false,
    default: false,
    schema: {
      create: false,
      update: false,
      response: true,
      example: false,
    },
  })
  requireSNI: boolean;

  @property({
    type: 'boolean',
    required: false,
    default: false,
    schema: {
      create: false,
      update: false,
      response: true,
      example: false,
    },
  })
  staplerOCSPEnabled: boolean;


  constructor(data?: Partial<TLSServer>) {
    super(data);
    this.as3Class = 'TLS_Server';
  }
}
export interface TLSServerCertificate {
  certificateId: string;
  matchToSNI: string;
  certContent?: Certificate
}
