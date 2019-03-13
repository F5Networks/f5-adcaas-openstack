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
import {Adc, AdcResponse, AdcCollectionResponse} from '../models';
import {AdcRepository} from '../repositories';
import {AdcSchema} from '.';

const prefix = '/adcaas/v1';

export class AdcController {
  constructor(
    @repository(AdcRepository)
    public adcRepository: AdcRepository,
  ) {}

  @post(prefix + '/adcs', {
    responses: {
      '200': {
        description: 'Successfully create ADC resource',
        content: {'application/json': AdcSchema.adcResponse},
      },
      '400': {
        description: 'Invalid ADC resource',
        content: {'application/json': AdcSchema.BadRequest},
      },
      '422': {
        description: 'Unprocessable ADC resource',
        content: {'application/json': AdcSchema.UnprocessableEntity},
      },
    },
  })
  async create(
    @requestBody(AdcSchema.adcCreateRequest) reqBody: Partial<Adc>,
  ): Promise<AdcResponse> {
    try {
      return new AdcResponse(await this.adcRepository.create(new Adc(reqBody)));
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }

  @get(prefix + '/adcs/count', {
    responses: {
      '200': {
        description: 'ADC resource count',
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
        description: 'Successfully retrieve ADC resources',
        content: {'application/json': AdcSchema.adcCollectionResponse},
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Adc)) filter?: Filter,
  ): Promise<AdcCollectionResponse> {
    let data = await this.adcRepository.find(filter);
    return new AdcCollectionResponse(data);
  }

  @get(prefix + '/adcs/{id}', {
    responses: {
      '200': {
        description: 'Successfully update ADC resource',
      },
      '404': {
        description: 'Can not find ADC resource',
        content: {'application/json': AdcSchema.NotFound},
      },
    },
  })
  async findById(@param(AdcSchema.adcId) id: string): Promise<AdcResponse> {
    let data = await this.adcRepository.findById(id);
    return new AdcResponse(data);
  }

  @patch(prefix + '/adcs/{id}', {
    responses: {
      '204': {
        description: 'Successfully update ADC resource',
      },
      '404': {
        description: 'Can not find ADC resource',
        content: {'application/json': AdcSchema.NotFound},
      },
    },
  })
  async updateById(
    @param(AdcSchema.adcId) id: string,
    @requestBody(AdcSchema.adcUpdateRequest) adc: Partial<Adc>,
  ): Promise<void> {
    await this.adcRepository.updateById(id, adc);
  }

  @del(prefix + '/adcs/{id}', {
    responses: {
      '204': {
        description: 'Successfully delete ADC resource',
      },
      '404': {
        description: 'Can not find ADC resource',
        content: {'application/json': AdcSchema.NotFound},
      },
    },
  })
  async deleteById(@param(AdcSchema.adcId) id: string): Promise<void> {
    await this.adcRepository.deleteById(id);
  }
}
