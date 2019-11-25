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

import {
  Count,
  CountSchema,
  Filter,
  Where,
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  del,
  requestBody,
  HttpErrors,
  RequestContext,
  RestBindings,
} from '@loopback/rest';
import {TLSServer} from '../models';
import {TLSserverRepository} from '../repositories';
import {Schema, Response, CollectionResponse} from '.';
import {BaseController} from './base.controller';
import {inject} from '@loopback/core';

const prefix = '/adcaas/v1';
const createDesc: string = 'TLSServer resource that need to be created';
const updateDesc: string =
  'TLSServer resource properties that need to be updated';

export class TLSServerController extends BaseController {
  constructor(
    @repository(TLSserverRepository)
    public tlsserverRepository: TLSserverRepository,
    @inject(RestBindings.Http.CONTEXT)
    protected reqCxt: RequestContext,
  ) {
    super(reqCxt);
  }

  @post(prefix + '/tlsservers', {
    responses: {
      '200': Schema.response(
        TLSServer,
        'Successfully create TLSServer resource',
      ),
      '400': Schema.badRequest('Invalid TLSServer resource'),
      '422': Schema.unprocessableEntity('Unprocessable TLSServer resource'),
    },
  })
  async create(
    @requestBody(Schema.createRequest(TLSServer, createDesc))
    reqBody: Partial<TLSServer>,
  ): Promise<Response> {
    try {
      reqBody.tenantId = await this.tenantId;
      const data = await this.tlsserverRepository.create(reqBody);
      return new Response(TLSServer, data);
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }

  @get(prefix + '/tlsservers', {
    responses: {
      '200': Schema.collectionResponse(
        TLSServer,
        'Successfully retrieve TLSServer resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(TLSServer))
    filter?: Filter,
  ): Promise<CollectionResponse> {
    let data = await this.tlsserverRepository.find(filter, {
      tenantId: await this.tenantId,
    });
    return new CollectionResponse(TLSServer, data);
  }

  @get(prefix + '/tlsservers/{tlsserverId}', {
    responses: {
      responses: {
        '200': Schema.response(
          TLSServer,
          'Successfully retrieve TLSServer resource',
        ),
        '404': Schema.notFound('Can not find TLSServer resource'),
      },
    },
  })
  async findById(
    @param(Schema.pathParameter('tlsserverId', 'TLSServer resource ID'))
    id: string,
  ): Promise<Response> {
    const data = await this.tlsserverRepository.findById(id, undefined, {
      tenantId: await this.tenantId,
    });
    return new Response(TLSServer, data);
  }

  @get(prefix + '/tlsservers/count', {
    responses: {
      '200': {
        description: 'Tlsserver model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(TLSServer)) where?: Where,
  ): Promise<Count> {
    return await this.tlsserverRepository.count(where);
  }

  @patch(prefix + '/tlsservers/{tlsserverId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully update TLSServer resource'),
      '404': Schema.notFound('Can not find TLSServer resource'),
    },
  })
  async updateById(
    @param(Schema.pathParameter('tlsserverId', 'TLSServer resource ID'))
    id: string,
    @requestBody(Schema.updateRequest(TLSServer, updateDesc))
    tlsserver: TLSServer,
  ): Promise<void> {
    await this.tlsserverRepository.updateById(id, tlsserver, {
      tenantId: await this.tenantId,
    });
  }

  @del(prefix + '/tlsservers/{tlsserverId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete TLSServer resource'),
      '404': Schema.notFound('Can not find TLSServer resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('tlsserverId', 'TLSServer resource ID'))
    id: string,
  ): Promise<void> {
    await this.tlsserverRepository.deleteById(id, {
      tenantId: await this.tenantId,
    });
  }
}
