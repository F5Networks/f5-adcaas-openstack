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
import {ProfileHTTP2ProfileRepository} from '../../repositories';
import {Schema, Response, CollectionResponse} from '..';
import {BaseController} from '../base.controller';
import {inject} from '@loopback/core';
import {ProfileHTTP2Profile} from '../../models';

const prefix = '/adcaas/v1/profiles';

const createDesc: string =
  'ProfileHTTP2Profile resource that need to be created';

export class ProfileHTTP2ProfileController extends BaseController {
  constructor(
    @inject(RestBindings.Http.CONTEXT)
    protected reqCxt: RequestContext,
    @repository(ProfileHTTP2ProfileRepository)
    private profileHTTP2ProfileRepository: ProfileHTTP2ProfileRepository,
  ) {
    super(reqCxt);
  }

  @post(prefix + '/http2_profiles', {
    responses: {
      '200': Schema.response(
        ProfileHTTP2Profile,
        'Successfully create HTTP2_Profile profile resource',
      ),
      '400': Schema.badRequest('Invalid profile resource'),
      '422': Schema.unprocessableEntity('Unprocessable profile resource'),
    },
  })
  async create(
    @requestBody(Schema.createRequest(ProfileHTTP2Profile, createDesc))
    reqBody: Partial<ProfileHTTP2Profile>,
  ): Promise<Response> {
    try {
      reqBody.tenantId = await this.tenantId;
      const data = await this.profileHTTP2ProfileRepository.create(reqBody);
      return new Response(ProfileHTTP2Profile, data);
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }

  @get(prefix + '/http2_profiles', {
    responses: {
      '200': Schema.collectionResponse(
        ProfileHTTP2Profile,
        'Successfully retrieve ProfileHTTP2Profile resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(ProfileHTTP2Profile))
    filter?: Filter,
  ): Promise<CollectionResponse> {
    const data = await this.profileHTTP2ProfileRepository.find(filter, {
      tenantId: await this.tenantId,
    });
    return new CollectionResponse(ProfileHTTP2Profile, data);
  }

  @del(prefix + '/http2_profiles/{profileId}', {
    responses: {
      '204': Schema.emptyResponse(
        'Successfully delete ProfileHTTP2Profile resource',
      ),
      '404': Schema.notFound('Can not find ProfileHTTP2Profile resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('profileId', 'ProfileHTTP2Profile resource ID'))
    id: string,
  ): Promise<void> {
    await this.profileHTTP2ProfileRepository.deleteById(id, {
      tenantId: await this.tenantId,
    });
  }
}
