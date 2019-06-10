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

import {Request, RestBindings, get, ResponseObject} from '@loopback/rest';
import {inject} from '@loopback/context';
import {AS3Service} from '../services';

const AS3_HOST: string = process.env.AS3_HOST || 'localhost';
const AS3_PORT: number = Number(process.env.AS3_PORT) || 7443;

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

const prefix = '/adcaas/v1';

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,
    @inject('services.AS3Service') private as3Service: AS3Service,
  ) {}

  // Map to `GET /ping`
  @get(prefix + '/ping', {
    responses: {
      '200': PING_RESPONSE,
    },
  })
  async ping(): Promise<object> {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from F5 ADCaaS for OpenStack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
      as3: await this.getAS3Info(),
    };
  }

  async getAS3Info(): Promise<string> {
    try {
      return await this.as3Service.info(AS3_HOST, AS3_PORT);
    } catch (e) {
      return e.message;
    }
  }
}
