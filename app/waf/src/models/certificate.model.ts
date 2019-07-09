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

import {CommonEntity, AS3Declaration} from '.';
import {model, property} from '@loopback/repository';

@model()
export class Certificate extends CommonEntity {
  @property({
    type: 'string',
    required: true,
    schema: {
      create: true,
      update: true,
      response: true,
      // example: 'http://10.145.70.193:9311/v1/containers/d7f34226-69b8-4e25-ac51-ad4849653a8',
      example: 'd7f34226-69b8-4e25-ac51-ad4849653a8',
    },
  })
  certificate: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      // example: 'http://10.145.70.193:9311/v1/containers/d7f34226-69b8-4e25-ac53-ad4849653a9',
      example: 'd7f34226-69b8-4e25-ac53-ad4849653a9',
    },
  })
  chainCA: string;

  @property({
    type: 'object',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
    },
  })
  issuerCertificate: object;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
    },
  })
  passphrase: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      // example: 'http://10.145.70.193:9311/v1/containers/d7f34226-69b8-4e25-ac56-ad4849653a0',
      example: 'd7f34226-69b8-4e25-ac56-ad4849653a0',
    },
  })
  pkcs12: string;

  @property({
    type: 'object',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
    },
  })
  pkcs12Options: object;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      // example: 'http://10.145.70.193:9311/v1/containers/d7f34226-69b8-4xxx-ac56-ad484965aaa',
      example: 'd7f34226-69b8-4xxx-ac56-ad484965aaa',
    },
  })
  privateKey: string;

  @property({
    type: 'object',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
    },
  })
  staplerOCSP: object;

  constructor(data?: Partial<Certificate>) {
    super(data);
    this.as3Class = 'Certificate';
  }

  getAS3Declaration(): AS3Declaration {
    let obj = super.getAS3Declaration();

    obj.certificate = this.certificate;
    obj.privateKey = this.privateKey;

    if (this.chainCA) {
      obj.chainCA = this.chainCA;
    }

    if (this.passphrase) {
      obj.passphrase = {
        ciphertext: Buffer.from(this.passphrase).toString('base64'),
      };
    }

    return obj;
  }
}
