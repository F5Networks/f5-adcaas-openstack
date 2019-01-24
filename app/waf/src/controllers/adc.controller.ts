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
import {Adc} from '../models';
import {AdcRepository} from '../repositories';

const prefix = '/adcaas/v1';

export class AdcController {
  constructor(
    @repository(AdcRepository)
    public adcRepository: AdcRepository,
  ) {}

  @post(prefix + '/adcs', {
    responses: {
      '200': {
        description: 'Adc model instance',
        content: {'application/json': {schema: {'x-ts-type': Adc}}},
      },
    },
  })
  async create(@requestBody() adc: Partial<Adc>): Promise<Adc> {
    return await this.adcRepository.create(adc);
  }

  @get(prefix + '/adcs/count', {
    responses: {
      '200': {
        description: 'Adc model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Adc)) where?: Where,
  ): Promise<Count> {
    return await this.adcRepository.count(where);
  }

  @get(prefix + '/adcs', {
    responses: {
      '200': {
        description: 'Array of Adc model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Adc}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Adc)) filter?: Filter,
  ): Promise<Adc[]> {
    return await this.adcRepository.find(filter);
  }

  @patch(prefix + '/adcs', {
    responses: {
      '200': {
        description: 'Adc PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() adc: Partial<Adc>,
    @param.query.object('where', getWhereSchemaFor(Adc)) where?: Where,
  ): Promise<Count> {
    return await this.adcRepository.updateAll(adc, where);
  }

  @get(prefix + '/adcs/{id}', {
    responses: {
      '200': {
        description: 'Adc model instance',
        content: {'application/json': {schema: {'x-ts-type': Adc}}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Adc> {
    return await this.adcRepository.findById(id);
  }

  @patch(prefix + '/adcs/{id}', {
    responses: {
      '204': {
        description: 'Adc PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() adc: Partial<Adc>,
  ): Promise<void> {
    await this.adcRepository.updateById(id, adc);
  }

  @put(prefix + '/adcs/{id}', {
    responses: {
      '204': {
        description: 'Adc PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() adc: Partial<Adc>,
  ): Promise<void> {
    adc.id = id;
    await this.adcRepository.replaceById(id, adc);
  }

  @del(prefix + '/adcs/{id}', {
    responses: {
      '204': {
        description: 'Adc DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.adcRepository.deleteById(id);
  }
}
