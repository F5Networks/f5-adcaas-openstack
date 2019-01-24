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
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {Service} from '../models';
import {ServiceRepository} from '../repositories';
import {v4 as uuid} from 'uuid';

const prefix = '/adcaas/v1';

export class ServiceController {
  constructor(
    @repository(ServiceRepository)
    public serviceRepository: ServiceRepository,
  ) {}

  @post(prefix + '/services', {
    responses: {
      '200': {
        description: 'Service model instance',
        content: {'application/json': {schema: {'x-ts-type': Service}}},
      },
    },
  })
  async create(@requestBody() service: Service): Promise<Service> {
    // pzhang(NOTE) more data sanitize in the future
    service.id = uuid();
    return await this.serviceRepository.create(service);
  }

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

  @patch(prefix + '/services', {
    responses: {
      '200': {
        description: 'Service PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() service: Service,
    @param.query.object('where', getWhereSchemaFor(Service)) where?: Where,
  ): Promise<Count> {
    return await this.serviceRepository.updateAll(service, where);
  }

  @get(prefix + '/services/{id}', {
    responses: {
      '200': {
        description: 'Service model instance',
        content: {'application/json': {schema: {'x-ts-type': Service}}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Service> {
    return await this.serviceRepository.findById(id);
  }

  @patch(prefix + '/services/{id}', {
    responses: {
      '204': {
        description: 'Service PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() service: Service,
  ): Promise<void> {
    await this.serviceRepository.updateById(id, service);
  }

  @put(prefix + '/services/{id}', {
    responses: {
      '204': {
        description: 'Service PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() service: Service,
  ): Promise<void> {
    await this.serviceRepository.replaceById(id, service);
  }

  @del(prefix + '/services/{id}', {
    responses: {
      '204': {
        description: 'Service DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.serviceRepository.deleteById(id);
  }
}
