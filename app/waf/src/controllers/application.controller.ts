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
} from '@loopback/rest';
import {inject} from '@loopback/context';
import {Application, AS3DeployRequest} from '../models';
import {
  ApplicationRepository,
  DeclarationRepository,
  AdcRepository,
} from '../repositories';
import {AS3Service} from '../services';
import {Schema, Response, CollectionResponse} from '.';

const AS3_HOST: string = process.env.AS3_HOST || 'localhost';
const AS3_PORT: number = Number(process.env.AS3_PORT) || 8443;

const prefix = '/adcaas/v1';

export class ApplicationController {
  constructor(
    @repository(ApplicationRepository)
    public applicationRepository: ApplicationRepository,
    @repository(DeclarationRepository)
    public declarationRepository: DeclarationRepository,
    @repository(AdcRepository)
    public adcRepository: AdcRepository,
    @inject('services.AS3Service') public as3Service: AS3Service,
  ) {}

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
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Application)) where?: Where,
  ): Promise<Count> {
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
      await this.applicationRepository.find(filter),
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
      await this.applicationRepository.findById(id),
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
    await this.applicationRepository.updateById(id, application);
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
    await this.applicationRepository.deleteById(id);
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
    let application = await this.applicationRepository.findById(id);

    if (!application.adcId || !application.defaultDeclarationId) {
      throw new HttpErrors.UnprocessableEntity(
        'No target ADC or no default Declaration to perform deploy action',
      );
    }

    let adc = await this.adcRepository.findById(application.adcId);
    let declaration = await this.declarationRepository.findById(
      application.defaultDeclarationId,
    );

    let req = new AS3DeployRequest(adc, application, declaration);
    return await this.as3Service.deploy(AS3_HOST, AS3_PORT, req);
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
    let application = await this.applicationRepository.findById(id);

    if (!application.adcId) {
      throw new HttpErrors.UnprocessableEntity(
        'No target ADC to perform deploy action',
      );
    }

    let adc = await this.adcRepository.findById(application.adcId);
    let req = new AS3DeployRequest(adc, application);
    return await this.as3Service.deploy(AS3_HOST, AS3_PORT, req);
  }
}
