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
import {Pool} from '../models';
import {PoolRepository} from '../repositories';

const prefix = '/adcaas/v1';

export class PoolController {
  constructor(
    @repository(PoolRepository)
    public poolRepository: PoolRepository,
  ) {}

  @post(prefix + '/pools', {
    responses: {
      '200': {
        description: 'Pool model instance',
        content: {'application/json': {schema: {'x-ts-type': Pool}}},
      },
    },
  })
  async create(@requestBody() pool: Pool): Promise<Pool> {
    return await this.poolRepository.create(pool);
  }

  @get(prefix + '/pools/count', {
    responses: {
      '200': {
        description: 'Pool model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Pool)) where?: Where,
  ): Promise<Count> {
    return await this.poolRepository.count(where);
  }

  @get(prefix + '/pools', {
    responses: {
      '200': {
        description: 'Array of Pool model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Pool}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Pool)) filter?: Filter,
  ): Promise<Pool[]> {
    return await this.poolRepository.find(filter);
  }

  @patch(prefix + '/pools', {
    responses: {
      '200': {
        description: 'Pool PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() pool: Pool,
    @param.query.object('where', getWhereSchemaFor(Pool)) where?: Where,
  ): Promise<Count> {
    return await this.poolRepository.updateAll(pool, where);
  }

  @get(prefix + '/pools/{id}', {
    responses: {
      '200': {
        description: 'Pool model instance',
        content: {'application/json': {schema: {'x-ts-type': Pool}}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Pool> {
    return await this.poolRepository.findById(id);
  }

  @patch(prefix + '/pools/{id}', {
    responses: {
      '204': {
        description: 'Pool PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() pool: Pool,
  ): Promise<void> {
    await this.poolRepository.updateById(id, pool);
  }

  @put(prefix + '/pools/{id}', {
    responses: {
      '204': {
        description: 'Pool PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() pool: Pool,
  ): Promise<void> {
    await this.poolRepository.replaceById(id, pool);
  }

  @del(prefix + '/pools/{id}', {
    responses: {
      '204': {
        description: 'Pool DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.poolRepository.deleteById(id);
  }
}
