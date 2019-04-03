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
} from '@loopback/rest';
import {Service} from '../models';
import {ServiceRepository, ApplicationRepository} from '../repositories';
import {Schema, Response, CollectionResponse} from '.';

const prefix = '/adcaas/v1';

const createDesc = 'Service resource that need to be created';
const updateDesc = 'Service resource properties that need to be updated';

export class ServiceController {
  constructor(
    @repository(ServiceRepository)
    public serviceRepository: ServiceRepository,
    @repository(ApplicationRepository)
    public applicationRepository: ApplicationRepository,
  ) {}

  @get(prefix + '/services/count', {
    responses: {
      '200': {
        description: 'Service model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Service)) where?: Where,
  ): Promise<Count> {
    return await this.serviceRepository.count(where);
  }

  @get(prefix + '/services', {
    responses: {
      '200': Schema.response(Service, 'Successfully retrieve Service resource'),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Service)) filter?: Filter,
  ): Promise<CollectionResponse> {
    let data = await this.serviceRepository.find(filter);
    return new CollectionResponse(Service, data);
  }

  @get(prefix + '/services/{serviceId}', {
    responses: {
      '200': Schema.response(Service, 'Successfully retrieve Service resource'),
      '404': Schema.notFound('Can not find Service resource'),
    },
  })
  async findById(
    @param(Schema.pathParameter('serviceId', 'Service resource ID')) id: string,
  ): Promise<Response> {
    let data = await this.serviceRepository.findById(id);
    return new Response(Service, data);
  }

  @post(prefix + '/services', {
    responses: {
      '200': Schema.response(Service, 'Successfully create Service resource'),
      '400': Schema.badRequest('Invalid Service resource'),
      '422': Schema.unprocessableEntity('Unprocessable Service resource'),
    },
  })
  async create(
    @requestBody(Schema.createRequest(Service, createDesc))
    service: Service,
  ): Promise<Response> {
    const appId = service.applicationId;
    delete service.applicationId;
    return new Response(
      Service,
      await this.applicationRepository.services(appId).create(service),
    );
  }

  @patch(prefix + '/services/{serviceId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully update Service resource'),
      '404': Schema.notFound('Can not find Service resource'),
    },
  })
  async updateById(
    @param(Schema.pathParameter('serviceId', 'Service resource ID')) id: string,
    @requestBody(Schema.updateRequest(Service, updateDesc))
    service: Partial<Service>,
  ): Promise<void> {
    await this.serviceRepository.updateById(id, service);
  }

  @del(prefix + '/services/{serviceId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete Service resource'),
      '404': Schema.notFound('Can not find Service resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('serviceId', 'Service resource ID')) id: string,
  ): Promise<void> {
    await this.serviceRepository.deleteById(id);
  }
}
