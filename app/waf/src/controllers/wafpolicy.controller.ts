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
import {Wafpolicy} from '../models';
import {WafpolicyRepository} from '../repositories';
import {Schema, Response, CollectionResponse} from '.';

const prefix = '/adcaas/v1';

export class WafpolicyController {
  constructor(
    @repository(WafpolicyRepository)
    public wafpolicyRepository: WafpolicyRepository,
  ) {}

  @post(prefix + '/wafpolicies', {
    responses: {
      '200': Schema.response(
        Wafpolicy,
        'Successfully create WAF Policy resource',
      ),
      '400': Schema.badRequest('Invalid WAF Policy resource'),
      '422': Schema.unprocessableEntity('Unprocessable WAF Policy resource'),
    },
  })
  async create(
    @requestBody(
      Schema.createRequest(
        Wafpolicy,
        'WAF Policy resource that need to be created',
      ),
    )
    wafpolicy: Partial<Wafpolicy>,
  ): Promise<Response> {
    return new Response(
      Wafpolicy,
      await this.wafpolicyRepository.create(wafpolicy),
    );
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
      '200': Schema.collectionResponse(
        Wafpolicy,
        'Successfully retrieve WAF Policy resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Wafpolicy))
    filter?: Filter,
  ): Promise<CollectionResponse> {
    return new CollectionResponse(
      Wafpolicy,
      await this.wafpolicyRepository.find(filter),
    );
  }

  @get(prefix + '/wafpolicies/{id}', {
    responses: {
      '200': Schema.response(
        Wafpolicy,
        'Successfully retrieve WAF Policy resource',
      ),
      '404': Schema.notFound('Can not find WAF Policy resource'),
    },
  })
  async findById(
    @param(Schema.pathParameter('id', 'WAF Policy resource ID')) id: string,
  ): Promise<Response> {
    return new Response(Wafpolicy, await this.wafpolicyRepository.findById(id));
  }

  @patch(prefix + '/wafpolicies/{id}', {
    responses: {
      '204': Schema.emptyResponse('Successfully update WAF Policy resource'),
      '404': Schema.notFound('Can not find ADC resource'),
    },
  })
  async updateById(
    @param(Schema.pathParameter('id', 'WAF Policy resource ID')) id: string,
    @requestBody(
      Schema.updateRequest(
        Wafpolicy,
        'WAF Policy resource properties that need to be updated',
      ),
    )
    wafpolicy: Partial<Wafpolicy>,
  ): Promise<void> {
    await this.wafpolicyRepository.updateById(id, wafpolicy);
  }

  @del(prefix + '/wafpolicies/{id}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete WAF Policy resource'),
      '404': Schema.notFound('Can not find WAF Policy resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('id', 'WAF Policy resource ID')) id: string,
  ): Promise<void> {
    await this.wafpolicyRepository.deleteById(id);
  }
}
