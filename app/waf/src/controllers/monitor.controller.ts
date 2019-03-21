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
import {Monitor} from '../models';
import {MonitorRepository} from '../repositories';
import uuid = require('uuid');

const prefix = '/adcaas/v1';

export class MonitorController {
  constructor(
    @repository(MonitorRepository)
    public monitorRepository: MonitorRepository,
  ) {}

  @post(prefix + '/monitors', {
    responses: {
      '200': {
        description: 'Monitor model instance',
        content: {'application/json': {schema: {'x-ts-type': Monitor}}},
      },
    },
  })
  async create(@requestBody() monitor: Partial<Monitor>): Promise<Monitor> {
    monitor.id = uuid();
    return await this.monitorRepository.create(monitor);
  }

  @get(prefix + '/monitors/count', {
    responses: {
      '200': {
        description: 'Monitor model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Monitor)) where?: Where,
  ): Promise<Count> {
    return await this.monitorRepository.count(where);
  }

  @get(prefix + '/monitors', {
    responses: {
      '200': {
        description: 'Array of Monitor model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Monitor}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Monitor)) filter?: Filter,
  ): Promise<Monitor[]> {
    return await this.monitorRepository.find(filter);
  }

  @get(prefix + '/monitors/{id}', {
    responses: {
      '200': {
        description: 'Monitor model instance',
        content: {'application/json': {schema: {'x-ts-type': Monitor}}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Monitor> {
    return await this.monitorRepository.findById(id);
  }

  @patch(prefix + '/monitors/{id}', {
    responses: {
      '204': {
        description: 'Monitor PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() monitor: Monitor,
  ): Promise<void> {
    await this.monitorRepository.updateById(id, monitor);
  }

  @del(prefix + '/monitors/{id}', {
    responses: {
      '204': {
        description: 'Monitor DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.monitorRepository.deleteById(id);
  }
}
