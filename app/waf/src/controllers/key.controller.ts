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
  RequestContext,
  RestBindings,
  HttpErrors,
} from '@loopback/rest';
import {Key, Adc} from '../models';
import {KeyRepository, AdcRepository} from '../repositories';
import {Schema, Response, CollectionResponse} from '.';
import {BaseController} from './base.controller';
import {inject} from '@loopback/core';
import {ASGService, ASGManager} from '../services';
import {ContentBody} from './cert.controller';

const prefix = '/adcaas/v1';

export class KeyController extends BaseController {
  asgMgr: ASGManager;

  constructor(
    @repository(KeyRepository)
    public keyRepository: KeyRepository,
    @repository(AdcRepository)
    public adcRepository: AdcRepository,
    @inject(RestBindings.Http.CONTEXT, {optional: true})
    protected reqCxt: RequestContext,
    @inject('services.ASGService')
    public asgService: ASGService,
  ) {
    super(reqCxt);
    this.asgMgr = new ASGManager(this.asgService);
  }

  @post(prefix + '/keys', {
    responses: {
      '200': Schema.response(Key, 'Successfully create Key resource'),
      '400': Schema.badRequest('Invalid Key resource'),
      '422': Schema.unprocessableEntity('Unprocessable Key resource'),
    },
  })
  async create(
    @requestBody(
      Schema.createRequest(Key, 'Key resource that need to be created'),
    )
    key: Partial<Key>,
  ): Promise<Response> {
    key.tenantId = await this.tenantId;
    return new Response(Key, await this.keyRepository.create(key));
  }

  @get(prefix + '/keys', {
    responses: {
      '200': Schema.collectionResponse(
        Key,
        'Successfully retrieve Key resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Key))
    filter?: Filter,
  ): Promise<CollectionResponse> {
    return new CollectionResponse(
      Key,
      await this.keyRepository.find({
        where: {or: [{tenantId: await this.tenantId}]},
      }),
    );
  }

  @get(prefix + '/keys/{id}', {
    responses: {
      '200': Schema.response(Key, 'Successfully retrieve Key resource'),
      '404': Schema.notFound('Can not find Key resource'),
    },
  })
  async findById(
    @param(Schema.pathParameter('id', 'Key resource ID')) id: string,
  ): Promise<Response> {
    return new Response(
      Key,
      await this.keyRepository.findById(id, {
        where: {
          and: [{or: [{tenantId: await this.tenantId}]}, {id: id}],
        },
      }),
    );
  }

  @get(prefix + '/keys/count', {
    responses: {
      '200': {
        description: 'Key model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Key)) where?: Where,
  ): Promise<Count> {
    return await this.keyRepository.count(where);
  }

  @post(prefix + '/keys/{id}/adcs/{adcId}', {
    responses: {
      '204': Schema.emptyResponse('Uploading Key resource'),
      '404': Schema.notFound('Can not find trustedDeivceId'),
      '422': Schema.unprocessableEntity(' Adc is not trusted'),
    },
  })
  async keyUpload(
    @param(Schema.pathParameter('id', 'Key resource ID')) id: string,
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) adcId: string,
    @requestBody() keyObj: ContentBody,
  ): Promise<void> {
    let key: Key = await this.keyRepository.findById(id, {
      where: {
        and: [{or: [{tenantId: await this.tenantId}]}, {id: id}],
      },
    });

    let adc: Adc = await this.adcRepository.findById(adcId, undefined, {
      tenantId: await this.tenantId,
    });

    if (!adc.management.trustedDeviceId) {
      throw new HttpErrors.UnprocessableEntity(`Adc: ${adc.id} is not trusted`);
    }
    let keyContent = keyObj.content || null;
    let name = 'F5Key-' + key.id;
    let length = 0;

    if (keyContent !== null) {
      length = keyContent.length;
    }

    if (!keyContent || length === 0) {
      throw new HttpErrors.UnprocessableEntity('empty key content');
    }

    try {
      await this.asgMgr.uploadFile(
        adc.management.trustedDeviceId!,
        keyContent,
        length,
        name,
      );

      let body = {
        command: 'install',
        name: `${name}`,
        'from-local-file': `/var/config/rest/downloads/${name}`,
      };
      //install the key
      await this.asgMgr.icontrolPost(
        adc.management.trustedDeviceId!,
        '/mgmt/tm/sys/crypto/key',
        body,
      );

      key.installed = true;
      key.remotepath = `/Common/${name}`;
      await this.keyRepository.updateById(id, key);
    } catch (error) {
      throw new HttpErrors.UnprocessableEntity(
        'upload key to asg service failed',
      );
    }
  }

  @get(prefix + '/keys/{id}/adcs/{adcId}', {
    responses: {
      '200': 'Status of key',
      '404': Schema.notFound('Can not find relative resource'),
      '422': Schema.unprocessableEntity(' Adc is not trusted'),
    },
  })
  async keyCheckStatus(
    @param(Schema.pathParameter('id', 'Key resource ID')) id: string,
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) adcId: string,
  ): Promise<Response> {
    let key: Key = await this.keyRepository.findById(id, {
      where: {
        and: [{or: [{tenantId: await this.tenantId}]}, {id: id}],
      },
    });

    let adc: Adc = await this.adcRepository.findById(adcId, undefined, {
      tenantId: await this.tenantId,
    });

    if (!adc.management.trustedDeviceId) {
      throw new HttpErrors.UnprocessableEntity(`Adc: ${adc.id} is not trusted`);
    }

    if (!key || !key.remotepath) {
      throw new HttpErrors.NotFound(
        `key: ${key.id} is not found in adc ${adc.id}`,
      );
    }

    let resp = undefined;
    let pathName = key.remotepath.replace('/Common/', '~Common~');
    try {
      resp = await this.asgMgr.icontrolGet(
        adc.management.trustedDeviceId!,
        '/mgmt/tm/sys/crypto/key/' + pathName,
      );
    } catch (error) {
      resp = JSON.parse(JSON.stringify(error));
      if (JSON.parse(resp.message)['code'] === 404) {
        throw new HttpErrors.NotFound(
          `key: ${key.id} is not found in adc ${adc.id}`,
        );
      }
      throw new HttpErrors.unprocessableEntity(
        'check key existence at bigip failed',
      );
    }

    return new Response(Key, key);
  }

  @patch(prefix + '/keys/{id}', {
    responses: {
      '204': Schema.emptyResponse('Successfully update Key resource'),
      '404': Schema.notFound('Can not find ADC resource'),
    },
  })
  async updateById(
    @param(Schema.pathParameter('id', 'Key resource ID')) id: string,
    @requestBody(
      Schema.updateRequest(
        Key,
        'Key resource properties that need to be updated',
      ),
    )
    key: Partial<Key>,
  ): Promise<void> {
    await this.keyRepository.updateById(id, key, {
      tenantId: await this.tenantId,
    });
  }

  @del(prefix + '/keys/{id}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete Key resource'),
      '404': Schema.notFound('Can not find Key resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('id', 'Key resource ID')) id: string,
  ): Promise<void> {
    await this.keyRepository.deleteById(id, {
      tenantId: await this.tenantId,
    });
  }
}
