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
  del,
  requestBody,
} from '@loopback/rest';
import {Service} from '../models';
import {ServiceRepository, ApplicationRepository} from '../repositories';
import uuid = require('uuid');

const prefix = '/adcaas/v1';

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
      '200': {
        description: 'Array of Service model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Service}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Service)) filter?: Filter,
  ): Promise<Service[]> {
    return await this.serviceRepository.find(filter);
  }

  @get(prefix + '/services/{service_id}', {
    responses: {
      '200': {
        description: 'Service model instance',
        content: {'application/json': {schema: {'x-ts-type': Service}}},
      },
    },
  })
  async findById(
    @param.path.string('service_id') service_id: string,
  ): Promise<Service> {
    return await this.serviceRepository.findById(service_id);
  }

  @post(prefix + '/services', {
    responses: {
      '200': {
        description: 'Service model instance',
        content: {'application/json': {schema: {'x-ts-type': Service}}},
      },
    },
  })
  async create(@requestBody() service: Service): Promise<Service> {
    service.id = uuid();
    const appId = service.applicationId;
    delete service.applicationId;
    return await this.applicationRepository.services(appId).create(service);
  }

  @del(prefix + '/services/{service_id}', {
    responses: {
      '204': {
        description: 'Service DELETE success',
      },
    },
  })
  async deleteById(
    @param.path.string('service_id') service_id: string,
  ): Promise<void> {
    await this.serviceRepository.deleteById(service_id);
  }
}
