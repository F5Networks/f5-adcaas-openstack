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
  RequestContext,
  RestBindings,
  HttpErrors,
} from '@loopback/rest';
import {Cert, Adc} from '../models';
import {CertRepository, AdcRepository} from '../repositories';
import {Schema, Response, CollectionResponse} from '.';
import {BaseController} from './base.controller';
import {inject} from '@loopback/core';
import {ASGService, ASGManager} from '../services';

const prefix = '/adcaas/v1';
export class ContentBody {
  content: string;
}

export class CertController extends BaseController {
  asgMgr: ASGManager;

  constructor(
    @repository(CertRepository)
    public certRepository: CertRepository,
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

  @post(prefix + '/certs', {
    responses: {
      '200': Schema.response(Cert, 'Successfully create Cert resource'),
      '400': Schema.badRequest('Invalid Cert resource'),
      '422': Schema.unprocessableEntity('Unprocessable Cert resource'),
    },
  })
  async create(
    @requestBody(
      Schema.createRequest(Cert, 'Cert resource that need to be created'),
    )
    cert: Partial<Cert>,
  ): Promise<Response> {
    cert.tenantId = await this.tenantId;
    return new Response(Cert, await this.certRepository.create(cert));
  }

  @get(prefix + '/certs', {
    responses: {
      '200': Schema.collectionResponse(
        Cert,
        'Successfully retrieve Cert resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Cert))
    filter?: Filter,
  ): Promise<CollectionResponse> {
    return new CollectionResponse(
      Cert,
      await this.certRepository.find({
        where: {or: [{tenantId: await this.tenantId}]},
      }),
    );
  }

  @get(prefix + '/certs/{id}', {
    responses: {
      '200': Schema.response(Cert, 'Successfully retrieve Cert resource'),
      '404': Schema.notFound('Can not find Cert resource'),
    },
  })
  async findById(
    @param(Schema.pathParameter('id', 'Cert resource ID')) id: string,
  ): Promise<Response> {
    return new Response(
      Cert,
      await this.certRepository.findById(id, {
        where: {
          and: [{or: [{tenantId: await this.tenantId}]}, {id: id}],
        },
      }),
    );
  }

  @get(prefix + '/certs/count', {
    responses: {
      '200': {
        description: 'Cert model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Cert)) where?: Where,
  ): Promise<Count> {
    return await this.certRepository.count(where);
  }

  @post(prefix + '/certs/{id}/adcs/{adcId}', {
    responses: {
      '204': Schema.emptyResponse('Uploading Cert resource'),
      '404': Schema.notFound('Can not find trustedDeivceId'),
      '422': Schema.unprocessableEntity(' Adc is not trusted'),
    },
  })
  async certUpload(
    @param(Schema.pathParameter('id', 'Cert resource ID')) id: string,
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) adcId: string,
    @requestBody() certObj: ContentBody,
  ): Promise<Response> {
    let cert: Cert = await this.certRepository.findById(id, {
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

    let certContent = certObj.content || null;
    let name = 'F5Cert-' + cert.id;
    let length = 0;

    if (certContent !== null) {
      length = certContent.length;
    }

    if (!certContent || length === 0) {
      throw new HttpErrors.UnprocessableEntity('empty cert content');
    }

    try {
      await this.asgMgr.uploadFile(
        adc.management.trustedDeviceId!,
        certContent,
        length,
        name,
      );

      let body = {
        command: 'install',
        name: `${name}`,
        'from-local-file': `/var/config/rest/downloads/${name}`,
      };
      //Install cert
      await this.asgMgr.icontrolPost(
        adc.management.trustedDeviceId!,
        '/mgmt/tm/sys/crypto/cert',
        body,
      );
      cert.installed = true;
      cert.remotepath = `/Common/${name}`;
      await this.certRepository.updateById(id, cert);
      return new Response(Cert, await this.certRepository.findById(cert.id));
    } catch (error) {
      throw new HttpErrors.UnprocessableEntity(
        'upload cert to asg service failed',
      );
    }
  }

  /*check from the bigip if a cert exists in the bigip or not */
  @get(prefix + '/certs/{id}/adcs/{adcId}', {
    responses: {
      '200': 'Status of cert',
      '404': Schema.notFound('Can not find relative resource'),
      '422': Schema.unprocessableEntity(' Adc is not trusted'),
    },
  })
  async certCheckStatus(
    @param(Schema.pathParameter('id', 'Cert resource ID')) id: string,
    @param(Schema.pathParameter('adcId', 'ADC resource ID')) adcId: string,
  ): Promise<Response> {
    let cert: Cert = await this.certRepository.findById(id, {
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

    if (!cert || !cert.remotepath) {
      throw new HttpErrors.NotFound(
        `cert: ${cert.id} is not found in adc ${adc.id}`,
      );
    }

    let resp = undefined;
    let pathName = cert.remotepath.replace('/Common/', '~Common~');

    try {
      resp = await this.asgMgr.icontrolGet(
        adc.management.trustedDeviceId!,
        '/mgmt/tm/sys/crypto/cert/' + pathName,
      );
    } catch (error) {
      resp = JSON.parse(JSON.stringify(error));
      if (JSON.parse(resp.message)['code'] === 404) {
        throw new HttpErrors.NotFound(
          `cert: ${cert.id} is not found in adc ${adc.id}`,
        );
      }
      throw new HttpErrors.unprocessableEntity(
        'check cert existence at bigip failed',
      );
    }

    return new Response(Cert, cert);
  }

  @patch(prefix + '/certs/{id}', {
    responses: {
      '204': Schema.emptyResponse('Successfully update cert resource'),
      '404': Schema.notFound('Can not find ADC resource'),
    },
  })
  async updateById(
    @param(Schema.pathParameter('id', 'Cert resource ID')) id: string,
    @requestBody(
      Schema.updateRequest(
        Cert,
        'Cert resource properties that need to be updated',
      ),
    )
    cert: Partial<Cert>,
  ): Promise<void> {
    await this.certRepository.updateById(id, cert, {
      tenantId: await this.tenantId,
    });
  }

  @del(prefix + '/certs/{id}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete Cert resource'),
      '404': Schema.notFound('Can not find Cert resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('id', 'Cert resource ID')) id: string,
  ): Promise<void> {
    await this.certRepository.deleteById(id, {
      tenantId: await this.tenantId,
    });
  }
}
