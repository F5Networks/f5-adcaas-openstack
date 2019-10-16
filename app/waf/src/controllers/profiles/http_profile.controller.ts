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
import {ProfileHTTPProfileRepository} from '../../repositories';
import {Schema, Response, CollectionResponse} from '..';
import {BaseController} from '../base.controller';
import {inject} from '@loopback/core';
import {ProfileHttpProfile} from '../../models';

const prefix = '/adcaas/v1/profiles';

const createDesc: string =
  'ProfileHTTPProfile resource that need to be created';

export class ProfileHttpProfileController extends BaseController {
  constructor(
    @inject(RestBindings.Http.CONTEXT)
    protected reqCxt: RequestContext,
    @repository(ProfileHTTPProfileRepository)
    private profileHTTPProfileRepository: ProfileHTTPProfileRepository,
  ) {
    super(reqCxt);
  }

  @post(prefix + '/http_profiles', {
    responses: {
      '200': Schema.response(
        ProfileHttpProfile,
        'Successfully create HTTP_Profile profile resource',
      ),
      '400': Schema.badRequest('Invalid profile resource'),
      '422': Schema.unprocessableEntity('Unprocessable profile resource'),
    },
  })
  async create(
    @requestBody(Schema.createRequest(ProfileHttpProfile, createDesc))
    reqBody: Partial<ProfileHttpProfile>,
  ): Promise<Response> {
    try {
      reqBody.tenantId = await this.tenantId;
      const data = await this.profileHTTPProfileRepository.create(reqBody);
      return new Response(ProfileHttpProfile, data);
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }

  @get(prefix + '/http_profiles', {
    responses: {
      '200': Schema.collectionResponse(
        ProfileHttpProfile,
        'Successfully retrieve ProfileHTTPProfile resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(ProfileHttpProfile))
    filter?: Filter,
  ): Promise<CollectionResponse> {
    const data = await this.profileHTTPProfileRepository.find(filter, {
      tenantId: await this.tenantId,
    });
    return new CollectionResponse(ProfileHttpProfile, data);
  }

  @del(prefix + '/http_profiles/{profileId}', {
    responses: {
      '204': Schema.emptyResponse(
        'Successfully delete ProfileHTTPProfile resource',
      ),
      '404': Schema.notFound('Can not find ProfileHTTPProfile resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('profileId', 'ProfileHTTPProfile resource ID'))
    id: string,
  ): Promise<void> {
    await this.profileHTTPProfileRepository.deleteById(id, {
      tenantId: await this.tenantId,
    });
  }
}
