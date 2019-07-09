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

import {CommonEntity, AS3Declaration, Certificate} from '.';
import {model, property} from '@loopback/repository';
import {as3Name} from './as3.model';

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
      example: false,
    },
  })
  c3dEnabled: false;

  @property({
    type: 'object',
    required: false,
    schema: {
      create: false,
      update: false,
      response: true,
    },
  })
  c3dOCSP: object;

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
    type: 'array',
    itemType: 'object',
    required: false,
    schema: {
      create: true,
      update: true,
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

  getAS3Declaration(): AS3Declaration {
    let obj = super.getAS3Declaration();

    let certificates = [];
    for (let certIndex of this.certificates) {
      let index: TLSServerCertificate = {};

      if (certIndex.certificate) {
        index.certificate = as3Name(certIndex.certificate);
      }
      if (certIndex.matchToSNI) {
        index.matchToSNI = certIndex.matchToSNI;
      }
      certificates.push(index);
    }
    obj.certificates = certificates;

    return obj;
  }
}
export interface TLSServerCertificate {
  certificate?: string;
  matchToSNI?: string;
  certContent?: Certificate;
}
