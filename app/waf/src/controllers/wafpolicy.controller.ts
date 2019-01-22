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
import {Wafpolicy} from '../models';
import {WafpolicyRepository} from '../repositories';

const prefix = '/adcaas/v1';

export class WafpolicyController {
  constructor(
    @repository(WafpolicyRepository)
    public wafpolicyRepository: WafpolicyRepository,
  ) {}

  @post(prefix + '/wafpolicies', {
    responses: {
      '200': {
        description: 'Wafpolicy model instance',
        content: {'application/json': {schema: {'x-ts-type': Wafpolicy}}},
      },
    },
  })
  async create(@requestBody() wafpolicy: Wafpolicy): Promise<Wafpolicy> {
    return await this.wafpolicyRepository.create(wafpolicy);
  }

  @get(prefix + '/wafpolicies/count', {
    responses: {
      '200': {
        description: 'Wafpolicy model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Wafpolicy)) where?: Where,
  ): Promise<Count> {
    return await this.wafpolicyRepository.count(where);
  }

  @get(prefix + '/wafpolicies', {
    responses: {
      '200': {
        description: 'Array of Wafpolicy model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Wafpolicy}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Wafpolicy))
    filter?: Filter,
  ): Promise<Wafpolicy[]> {
    return await this.wafpolicyRepository.find(filter);
  }

  @patch(prefix + '/wafpolicies', {
    responses: {
      '200': {
        description: 'Wafpolicy PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() wafpolicy: Wafpolicy,
    @param.query.object('where', getWhereSchemaFor(Wafpolicy)) where?: Where,
  ): Promise<Count> {
    return await this.wafpolicyRepository.updateAll(wafpolicy, where);
  }

  @get(prefix + '/wafpolicies/{id}', {
    responses: {
      '200': {
        description: 'Wafpolicy model instance',
        content: {'application/json': {schema: {'x-ts-type': Wafpolicy}}},
      },
    },
  })
  async findById(@param.path.number('id') id: string): Promise<Wafpolicy> {
    return await this.wafpolicyRepository.findById(id);
  }

  @patch(prefix + '/wafpolicies/{id}', {
    responses: {
      '204': {
        description: 'Wafpolicy PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: string,
    @requestBody() wafpolicy: Wafpolicy,
  ): Promise<void> {
    await this.wafpolicyRepository.updateById(id, wafpolicy);
  }

  @put(prefix + '/wafpolicies/{id}', {
    responses: {
      '204': {
        description: 'Wafpolicy PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: string,
    @requestBody() wafpolicy: Wafpolicy,
  ): Promise<void> {
    await this.wafpolicyRepository.replaceById(id, wafpolicy);
  }

  @del(prefix + '/wafpolicies/{id}', {
    responses: {
      '204': {
        description: 'Wafpolicy DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: string): Promise<void> {
    await this.wafpolicyRepository.deleteById(id);
  }
}
