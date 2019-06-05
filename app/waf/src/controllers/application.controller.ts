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
  repository,
  Where,
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
import { inject } from '@loopback/context';
import {
  Application,
  AS3DeployRequest,
  AS3PatchReqeust,
  patchOP,
} from '../models';
import {
  ApplicationRepository,
  DeclarationRepository,
  AdcRepository,
} from '../repositories';
import { AS3Service } from '../services';
import { BaseController, Schema, Response, CollectionResponse } from '.';

const AS3_HOST: string = process.env.AS3_HOST || 'localhost';
const AS3_PORT: number = Number(process.env.AS3_PORT) || 7443;

const prefix = '/adcaas/v1';

export class ApplicationController extends BaseController {
  constructor(
    @repository(ApplicationRepository)
    public applicationRepository: ApplicationRepository,
    @repository(DeclarationRepository)
    public declarationRepository: DeclarationRepository,
    @repository(AdcRepository)
    public adcRepository: AdcRepository,
    @inject('services.AS3Service') public as3Service: AS3Service,
    //Suppress get injection binding exeption by using {optional: true}
    @inject(RestBindings.Http.CONTEXT, { optional: true })
    protected reqCxt: RequestContext,
  ) {
    super(reqCxt);
  }

  @post(prefix + '/applications', {
    responses: {
      '200': Schema.response(
        Application,
        'Successfully create Application resource',
      ),
      '400': Schema.badRequest('Invalid Application resource'),
      '422': Schema.unprocessableEntity('Unprocessable Application resource'),
    },
  })
  async create(
    @requestBody(
      Schema.createRequest(
        Application,
        'Application resource that need to be created',
      ),
    )
    application: Partial<Application>,
  ): Promise<Response> {
    try {
      application.tenantId = await this.tenantId;
      return new Response(
        Application,
        await this.applicationRepository.create(application),
      );
    } catch (error) {
      throw new HttpErrors.BadRequest(error.detail);
    }
  }

  @get(prefix + '/applications/count', {
    responses: {
      '200': {
        description: 'Application model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Application)) where?: Where,
  ): Promise<Count> {
    //TODO: support multi-tenancy
    return await this.applicationRepository.count(where);
  }

  @get(prefix + '/applications', {
    responses: {
      '200': Schema.collectionResponse(
        Application,
        'Successfully retrieve Application resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Application))
    filter?: Filter,
  ): Promise<CollectionResponse> {
    return new CollectionResponse(
      Application,
      await this.applicationRepository.find(filter, {
        tenantId: await this.tenantId,
      }),
    );
  }

  @get(prefix + '/applications/{applicationId}', {
    responses: {
      '200': Schema.response(
        Application,
        'Successfully retrieve Application resource',
      ),
      '404': Schema.notFound('Can not find Application resource'),
    },
  })
  async findById(
    @param(Schema.pathParameter('applicationId', 'Application resource ID'))
    id: string,
  ): Promise<Response> {
    return new Response(
      Application,
      await this.applicationRepository.findById(id, undefined, {
        tenantId: await this.tenantId,
      }),
    );
  }

  @patch(prefix + '/applications/{applicationId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully update Application resource'),
      '404': Schema.notFound('Can not find Application resource'),
    },
  })
  async updateById(
    @param(Schema.pathParameter('applicationId', 'Application resource ID'))
    id: string,
    @requestBody(
      Schema.updateRequest(
        Application,
        'Application resource properties that need to be updated',
      ),
    )
    application: Partial<Application>,
  ): Promise<void> {
    await this.applicationRepository.updateById(id, application, {
      tenantId: await this.tenantId,
    });
  }

  @del(prefix + '/applications/{applicationId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete Application resource'),
      '404': Schema.notFound('Can not find Application resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('applicationId', 'Application resource ID'))
    id: string,
  ): Promise<void> {
    await this.applicationRepository.deleteById(id, {
      tenantId: await this.tenantId,
    });
  }

  @post(prefix + '/applications/{applicationId}/deploy', {
    responses: {
      '204': Schema.emptyResponse('Successfully deploy Application resource'),
      '404': Schema.notFound('Can not find Application resource'),
      '422': Schema.unprocessableEntity('Fail to deploy Application resource'),
    },
  })
  async deployById(
    @param(Schema.pathParameter('applicationId', 'Application resource ID'))
    id: string,
  ): Promise<string> {
    let tenantId = await this.tenantId;

    let application = await this.applicationRepository.findById(id, undefined, {
      tenantId: tenantId,
    });

    if (!application.adcId || !application.defaultDeclarationId) {
      throw new HttpErrors.UnprocessableEntity(
        'No target ADC or no default Declaration to perform deploy action',
      );
    }

    let adc = await this.adcRepository.findById(application.adcId, undefined, {
      tenantId: tenantId,
    });

    let declaration = await this.declarationRepository.findById(
      application.defaultDeclarationId,
      undefined,
      { tenantId: tenantId },
    );

    let operation = patchOP.Replace;
    let req = new AS3PatchReqeust(adc, application, operation, declaration);

    let res: string = '';
    try {
      res = await this.as3Service.deploy(AS3_HOST, AS3_PORT, req);
    } catch (error) {
      /*We check the return message from BIGIP. If the error value mesage is
    "path does not exisst",which means the bigip does not contain the tenant
    yet, then we will deploy the whole declaration to create the tenant
    partition and add the application. */

      if (
        JSON.stringify(error).indexOf(
          'InvalidPatchOperationError: path does not exist',
        ) !== -1
      ) {
        /*Turn to Deploy method */
        let newReq = new AS3DeployRequest(adc, application, declaration);
        res = await this.as3Service.deploy(AS3_HOST, AS3_PORT, newReq);
      } else {
        res = error;
      }
    }
    return res;
  }

  @post(prefix + '/applications/{applicationId}/cleanup', {
    responses: {
      '204': Schema.emptyResponse('Successfully cleanup Application resource'),
      '404': Schema.notFound('Can not find Application resource'),
    },
  })
  async cleanupById(
    @param(Schema.pathParameter('applicationId', 'Application resource ID'))
    id: string,
  ): Promise<string> {
    let tenantId = await this.tenantId;

    let application = await this.applicationRepository.findById(id, undefined, {
      tenantId: tenantId,
    });

    if (!application.adcId) {
      throw new HttpErrors.UnprocessableEntity(
        'No target ADC to perform deploy action',
      );
    }

   let adc = await this.adcRepository.findById(application.adcId, undefined, {
     tenantId: tenantId,
   });

  //  let adc = await this.adcRepository.findById(application.adcId, undefined, undefined,);

    let operation = patchOP.Remove;
    let req = new AS3PatchReqeust(adc, application, operation);
    return await this.as3Service.deploy(AS3_HOST, AS3_PORT, req);
  }
}
