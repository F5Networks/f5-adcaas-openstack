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
import {Endpointpolicy} from '../models';
import {EndpointpolicyRepository} from '../repositories';
import uuid = require('uuid');
const prefix = '/adcaas/v1';
export class EndpointpolicyController {
  constructor(
    @repository(EndpointpolicyRepository)
    public endpointpolicyRepository: EndpointpolicyRepository,
  ) {}

  @post(prefix + '/endpointpolicies', {
    responses: {
      '200': {
        description: 'Endpointpolicy model instance',
        content: {'application/json': {schema: {'x-ts-type': Endpointpolicy}}},
      },
    },
  })
  async create(
    @requestBody() endpointpolicy: Partial<Endpointpolicy>,
  ): Promise<Endpointpolicy> {
    if (!endpointpolicy.id){
      endpointpolicy.id=uuid();
    }
    return await this.endpointpolicyRepository.create(endpointpolicy);
  }

  @get(prefix + '/endpointpolicies/count', {
    responses: {
      '200': {
        description: 'Endpointpolicy model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Endpointpolicy))
    where?: Where,
  ): Promise<Count> {
    return await this.endpointpolicyRepository.count(where);
  }

  @get(prefix + '/endpointpolicies', {
    responses: {
      '200': {
        description: 'Array of Endpointpolicy model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Endpointpolicy}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Endpointpolicy))
    filter?: Filter,
  ): Promise<Endpointpolicy[]> {
    return await this.endpointpolicyRepository.find(filter);
  }

  @patch(prefix + '/endpointpolicies', {
    responses: {
      '200': {
        description: 'Endpointpolicy PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() endpointpolicy: Endpointpolicy,
    @param.query.object('where', getWhereSchemaFor(Endpointpolicy))
    where?: Where,
  ): Promise<Count> {
    return await this.endpointpolicyRepository.updateAll(endpointpolicy, where);
  }

  @get(prefix + '/endpointpolicies/{id}', {
    responses: {
      '200': {
        description: 'Endpointpolicy model instance',
        content: {'application/json': {schema: {'x-ts-type': Endpointpolicy}}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Endpointpolicy> {
    return await this.endpointpolicyRepository.findById(id);
  }

  @patch(prefix + '/endpointpolicies/{id}', {
    responses: {
      '204': {
        description: 'Endpointpolicy PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() endpointpolicy: Endpointpolicy,
  ): Promise<void> {
    await this.endpointpolicyRepository.updateById(id, endpointpolicy);
  }

  @put(prefix + '/endpointpolicies/{id}', {
    responses: {
      '204': {
        description: 'Endpointpolicy PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() endpointpolicy: Endpointpolicy,
  ): Promise<void> {
    await this.endpointpolicyRepository.replaceById(id, endpointpolicy);
  }

  @del(prefix + '/endpointpolicies/{id}', {
    responses: {
      '204': {
        description: 'Endpointpolicy DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.endpointpolicyRepository.deleteById(id);
  }
}
