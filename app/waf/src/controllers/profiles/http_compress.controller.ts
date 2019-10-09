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
import {ProfileHTTPCompressionRepository} from '../../repositories';
import {Schema, Response, CollectionResponse} from '..';
import {BaseController} from '../base.controller';
import {inject} from '@loopback/core';
import {ProfileHTTPCompression} from '../../models';

const prefix = '/adcaas/v1/profiles';

const createDesc: string =
  'ProfileHTTPCompress resource that need to be created';

export class ProfileHTTPCompressionController extends BaseController {
  constructor(
    @inject(RestBindings.Http.CONTEXT)
    protected reqCxt: RequestContext,
    @repository(ProfileHTTPCompressionRepository)
    private profileHTTPCompressionRepository: ProfileHTTPCompressionRepository,
  ) {
    super(reqCxt);
  }

  @post(prefix + '/http_compress_profiles', {
    responses: {
      '200': Schema.response(
        ProfileHTTPCompression,
        'Successfully create HTTP_Compress profile resource',
      ),
      '400': Schema.badRequest('Invalid profile resource'),
      '422': Schema.unprocessableEntity('Unprocessable profile resource'),
    },
  })
  async create(
    @requestBody(Schema.createRequest(ProfileHTTPCompression, createDesc))
    reqBody: Partial<ProfileHTTPCompression>,
  ): Promise<Response> {
    try {
      reqBody.tenantId = await this.tenantId;
      const data = await this.profileHTTPCompressionRepository.create(reqBody);
      return new Response(ProfileHTTPCompression, data);
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }

  @get(prefix + '/http_compress_profiles', {
    responses: {
      '200': Schema.collectionResponse(
        ProfileHTTPCompression,
        'Successfully retrieve ProfileHTTPCompress resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(ProfileHTTPCompression))
    filter?: Filter,
  ): Promise<CollectionResponse> {
    const data = await this.profileHTTPCompressionRepository.find(filter, {
      tenantId: await this.tenantId,
    });
    return new CollectionResponse(ProfileHTTPCompression, data);
  }

  @del(prefix + '/http_compress_profiles/{profileId}', {
    responses: {
      '204': Schema.emptyResponse(
        'Successfully delete ProfileHTTPCompress resource',
      ),
      '404': Schema.notFound('Can not find ProfileHTTPCompress resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('profileId', 'ProfileHTTPCompress resource ID'))
    id: string,
  ): Promise<void> {
    await this.profileHTTPCompressionRepository.deleteById(id, {
      tenantId: await this.tenantId,
    });
  }
}
