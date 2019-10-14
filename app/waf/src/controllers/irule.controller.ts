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

import {Filter, repository} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  del,
  requestBody,
  HttpErrors,
  RequestContext,
  RestBindings,
} from '@loopback/rest';
import {IRuleRepository} from '../repositories';
import {Schema, Response, CollectionResponse} from '.';
import {BaseController} from './base.controller';
import {inject} from '@loopback/core';
import {IRule} from '../models';

const prefix = '/adcaas/v1';

const createDesc: string =
  'ProfileHTTPCompress resource that need to be created';

export class IRuleController extends BaseController {
  constructor(
    @inject(RestBindings.Http.CONTEXT)
    protected reqCxt: RequestContext,
    @repository(IRuleRepository)
    private iRuleRepository: IRuleRepository,
  ) {
    super(reqCxt);
  }

  @post(prefix + '/irules', {
    responses: {
      '200': Schema.response(IRule, 'Successfully create irule resource'),
      '400': Schema.badRequest('Invalid irule resource'),
      '422': Schema.unprocessableEntity('Unprocessable irule resource'),
    },
  })
  async create(
    @requestBody(Schema.createRequest(IRule, createDesc))
    reqBody: Partial<IRule>,
  ): Promise<Response> {
    try {
      reqBody.tenantId = await this.tenantId;
      const data = await this.iRuleRepository.create(reqBody);
      return new Response(IRule, data);
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }

  @get(prefix + '/irules', {
    responses: {
      '200': Schema.collectionResponse(
        IRule,
        'Successfully retrieve ProfileHTTPCompress resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(IRule))
    filter?: Filter,
  ): Promise<CollectionResponse> {
    const data = await this.iRuleRepository.find(filter, {
      tenantId: await this.tenantId,
    });
    return new CollectionResponse(IRule, data);
  }

  @del(prefix + '/irules/{iRuleId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete irule resource'),
      '404': Schema.notFound('Can not find irule resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('iRuleId', 'irule resource ID'))
    id: string,
  ): Promise<void> {
    await this.iRuleRepository.deleteById(id, {
      tenantId: await this.tenantId,
    });
  }
}
