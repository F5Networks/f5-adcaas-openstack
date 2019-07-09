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
  patch,
  del,
  requestBody,
  HttpErrors,
  RequestContext,
  RestBindings,
} from '@loopback/rest';
import {Certificate} from '../models';
import {CertificateRepository} from '../repositories';
import {Schema, Response, CollectionResponse} from '.';
import {BaseController} from './base.controller';
import {inject} from '@loopback/core';

const prefix = '/adcaas/v1';
const createDesc: string = 'Certificate resource that need to be created';
const updateDesc: string =
  'Certificate resource properties that need to be updated';

export class CertificateController extends BaseController {
  constructor(
    @repository(CertificateRepository)
    public certificateRepository: CertificateRepository,
    @inject(RestBindings.Http.CONTEXT)
    protected reqCxt: RequestContext,
  ) {
    super(reqCxt);
  }

  @post(prefix + '/certificates', {
    responses: {
      '200': Schema.response(Certificate, 'Successfully create Certificate resource'),
      '400': Schema.badRequest('Invalid Certificate resource'),
      '422': Schema.unprocessableEntity('Unprocessable Certificate resource'),
    },
  })
  async create(
    @requestBody(Schema.createRequest(Certificate, createDesc))
    reqBody: Partial<Certificate>,
  ): Promise<Response> {
    try {
      reqBody.tenantId = await this.tenantId;
      const data = await this.certificateRepository.create(reqBody);
      return new Response(Certificate, data);
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }

  @get(prefix + '/certificates', {
    responses: {
      '200': Schema.collectionResponse(
        Certificate,
        'Successfully retrieve Certificate resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Certificate)) filter?: Filter,
  ): Promise<CollectionResponse> {
    let data = await this.certificateRepository.find(filter, {
      tenantId: await this.tenantId,
    });
    return new CollectionResponse(Certificate, data);
  }

  @get(prefix + '/certificates/{certificateId}', {
    responses: {
      responses: {
        '200': Schema.response(Certificate, 'Successfully retrieve Certificate resource'),
        '404': Schema.notFound('Can not find Certificate resource'),
      },
    },
  })
  async findById(
    @param(Schema.pathParameter('certificateId', 'Certificate resource ID'))
    id: string,
  ): Promise<Response> {
    const data = await this.certificateRepository.findById(id, undefined, {
      tenantId: await this.tenantId,
    });
    return new Response(Certificate, data);
  }

  @patch(prefix + '/certificates/{certificateId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully update Certificate resource'),
      '404': Schema.notFound('Can not find Certificate resource'),
    },
  })
  async updateById(
    @param(Schema.pathParameter('certificateId', 'Certificate resource ID'))
    id: string,
    @requestBody(Schema.updateRequest(Certificate, updateDesc))
    certificate: Certificate,
  ): Promise<void> {
    console.log(id);
    await this.certificateRepository.updateById(id, certificate, {
      tenantId: await this.tenantId,
    });
  }

  @del(prefix + '/certificates/{certificateId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete Certificate resource'),
      '404': Schema.notFound('Can not find Certificate resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('certificateId', 'Certificate resource ID'))
    id: string,
  ): Promise<void> {
    await this.certificateRepository.deleteById(id, {
      tenantId: await this.tenantId,
    });
  }
}
