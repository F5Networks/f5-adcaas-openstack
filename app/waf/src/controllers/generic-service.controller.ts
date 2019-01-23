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
import {GenericService} from '../models';
import {GenericServiceRepository} from '../repositories';

export class GenericServiceController {
  constructor(
    @repository(GenericServiceRepository)
    public genericServiceRepository : GenericServiceRepository,
  ) {}

  @post('/genericservice', {
    responses: {
      '200': {
        description: 'GenericService model instance',
        content: {'application/json': {schema: {'x-ts-type': GenericService}}},
      },
    },
  })
  async create(@requestBody() genericService: GenericService): Promise<GenericService> {
    return await this.genericServiceRepository.create(genericService);
  }

  @get('/genericservice/count', {
    responses: {
      '200': {
        description: 'GenericService model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(GenericService)) where?: Where,
  ): Promise<Count> {
    return await this.genericServiceRepository.count(where);
  }

  @get('/genericservice', {
    responses: {
      '200': {
        description: 'Array of GenericService model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': GenericService}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(GenericService)) filter?: Filter,
  ): Promise<GenericService[]> {
    return await this.genericServiceRepository.find(filter);
  }

  @patch('/genericservice', {
    responses: {
      '200': {
        description: 'GenericService PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() genericService: GenericService,
    @param.query.object('where', getWhereSchemaFor(GenericService)) where?: Where,
  ): Promise<Count> {
    return await this.genericServiceRepository.updateAll(genericService, where);
  }

  @get('/genericservice/{id}', {
    responses: {
      '200': {
        description: 'GenericService model instance',
        content: {'application/json': {schema: {'x-ts-type': GenericService}}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<GenericService> {
    return await this.genericServiceRepository.findById(id);
  }

  @patch('/genericservice/{id}', {
    responses: {
      '204': {
        description: 'GenericService PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() genericService: GenericService,
  ): Promise<void> {
    await this.genericServiceRepository.updateById(id, genericService);
  }

  @put('/genericservice/{id}', {
    responses: {
      '204': {
        description: 'GenericService PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() genericService: GenericService,
  ): Promise<void> {
    await this.genericServiceRepository.replaceById(id, genericService);
  }

  @del('/genericservice/{id}', {
    responses: {
      '204': {
        description: 'GenericService DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.genericServiceRepository.deleteById(id);
  }
}
