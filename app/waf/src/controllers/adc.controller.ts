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
import {Schema} from '.';

const prefix = '/adcaas/v1';

export class AdcController {
  constructor(
    @repository(AdcRepository)
    public adcRepository: AdcRepository,
  ) {}

  readonly createDesc = 'ADC resource that need to be created';
  @post(prefix + '/adcs', {
    responses: {
      '200': Schema.response(Adc, 'Successfully create ADC resource'),
      '400': Schema.badRequest('Invalid ADC resource'),
      '422': Schema.unprocessableEntity('Unprocessable ADC resource'),
    },
  })
  async create(
    @requestBody(Schema.createRequest(Adc, this.createDesc))
    reqBody: Partial<Adc>,
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
      '200': Schema.collectionResponse(
        Adc,
        'Successfully retrieve ADC resources',
      ),
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
      '200': Schema.response(Adc, 'Successfully retrieve ADC resource'),
      '404': Schema.notFound('Can not find ADC resource'),
    },
  })
  async findById(
    @param(Schema.pathParameter('id', 'ADC resource ID')) id: string,
  ): Promise<AdcResponse> {
    let data = await this.adcRepository.findById(id);
    return new AdcResponse(data);
  }

  readonly updateDesc = 'ADC resource properties that need to be updated';
  @patch(prefix + '/adcs/{id}', {
    responses: {
      '204': Schema.emptyResponse('Successfully update ADC resource'),
      '404': Schema.notFound('Can not find ADC resource'),
    },
  })
  async updateById(
    @param(Schema.pathParameter('id', 'ADC resource ID')) id: string,
    @requestBody(Schema.updateRequest(Adc, this.updateDesc)) adc: Partial<Adc>,
  ): Promise<void> {
    await this.adcRepository.updateById(id, adc);
  }

  @del(prefix + '/adcs/{id}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete ADC resource'),
      '404': Schema.notFound('Can not find ADC resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('id', 'ADC resource ID')) id: string,
  ): Promise<void> {
    await this.adcRepository.deleteById(id);
  }
}
