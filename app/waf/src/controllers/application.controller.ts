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
import {inject} from '@loopback/context';
import {Application, AS3DeployRequest, Endpointpolicy, Rule} from '../models';
import {
  ApplicationRepository,
  AdcRepository,
  TenantAssociationRepository,
  ServiceRepository,
  PoolRepository,
  MemberRepository,
  WafpolicyRepository,
  EndpointpolicyRepository,
  RuleRepository,
} from '../repositories';
import {AS3Service} from '../services';
import {Schema} from '.';

const AS3_HOST: string = process.env.AS3_HOST || 'localhost';
const AS3_PORT: number = Number(process.env.AS3_PORT) || 8443;

const prefix = '/adcaas/v1';

export class ApplicationController {
  constructor(
    @repository(ApplicationRepository)
    public applicationRepository: ApplicationRepository,
    @repository(AdcRepository)
    public adcRepository: AdcRepository,
    @repository(TenantAssociationRepository)
    public tenantAssociationRepository: TenantAssociationRepository,
    @repository(ServiceRepository)
    public serviceRepository: ServiceRepository,
    @repository(PoolRepository)
    public poolRepository: PoolRepository,
    @repository(MemberRepository)
    public memberRepository: MemberRepository,
    @repository(WafpolicyRepository)
    public wafpolicyRepository: WafpolicyRepository,
    @repository(EndpointpolicyRepository)
    public endpointpolicyRepository: EndpointpolicyRepository,
    @repository(RuleRepository)
    public ruleRepository: RuleRepository,
    @inject('services.AS3Service') public as3Service: AS3Service,
  ) {}

  readonly createDesc = 'Application resource that need to be created';
  @post(prefix + '/applications', {
    responses: {
      '200': Schema.response(
        Application,
        'Successfully create Application resource',
      ),
      '400': Schema.badRequest('Invalid Application resource'),
      '422': Schema.unprocessableEntity('Unprocessable Application resource'),
    },
  })
  async create(
    @requestBody(Schema.createRequest(Application, this.createDesc))
    application: Partial<Application>,
  ): Promise<Application> {
    try {
      return await this.applicationRepository.create(application);
    } catch (error) {
      throw new HttpErrors.BadRequest(error.detail);
    }
  }

  @get(prefix + '/applications/count', {
    responses: {
      '200': {
        description: 'Application model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Application)) where?: Where,
  ): Promise<Count> {
    return await this.applicationRepository.count(where);
  }

  @get(prefix + '/applications', {
    responses: {
      '200': Schema.collectionResponse(
        Application,
        'Successfully retrieve Application resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Application))
    filter?: Filter,
  ): Promise<Application[]> {
    return await this.applicationRepository.find(filter);
  }

  @get(prefix + '/applications/{id}', {
    responses: {
      '200': Schema.response(
        Application,
        'Successfully retrieve Application resource',
      ),
      '404': Schema.notFound('Can not find Application resource'),
    },
  })
  async findById(
    @param(Schema.pathParameter('id', 'Application resource ID')) id: string,
  ): Promise<Application> {
    return await this.applicationRepository.findById(id);
  }

  readonly updateDesc =
    'Application resource properties that need to be updated';
  @patch(prefix + '/applications/{id}', {
    responses: {
      '204': Schema.emptyResponse('Successfully update Application resource'),
      '404': Schema.notFound('Can not find Application resource'),
    },
  })
  async updateById(
    @param(Schema.pathParameter('id', 'Application resource ID')) id: string,
    @requestBody(Schema.updateRequest(Application, this.updateDesc))
    application: Partial<Application>,
  ): Promise<void> {
    await this.applicationRepository.updateById(id, application);
  }

  @del(prefix + '/applications/{id}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete Application resource'),
      '404': Schema.notFound('Can not find Application resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('id', 'Application resource ID')) id: string,
  ): Promise<void> {
    await this.applicationRepository.deleteById(id);
  }

  @post(prefix + '/applications/{id}/deploy', {
    responses: {
      '204': Schema.emptyResponse('Successfully deploy Application resource'),
      '404': Schema.notFound('Can not find Application resource'),
    },
  })
  async deployById(
    @param(Schema.pathParameter('id', 'Application resource ID')) id: string,
  ): Promise<Object> {
    let application = await this.applicationRepository.findById(id);

    let services = await this.applicationRepository
      .services(application.id)
      .find();
    if (services.length === 0) {
      throw new HttpErrors.UnprocessableEntity(
        'No service in Application ' + application.id,
      );
    }

    let params: {[key: string]: Object} = {
      application: application,
    };

    let tenantAssocs = await this.tenantAssociationRepository.find({
      limit: 1,
      where: {
        tenantId: application.tenantId,
      },
    });

    if (tenantAssocs.length === 0) {
      tenantAssocs = await this.tenantAssociationRepository.find({
        limit: 1,
        where: {
          tenantId: 'default',
        },
      });

      if (tenantAssocs.length === 0) {
        throw new HttpErrors.UnprocessableEntity(
          'No ADC associated with Application ' + application.id,
        );
      }
    }

    let adcs = await this.adcRepository.find({
      where: {
        id: tenantAssocs[0].adcId,
      },
    });

    if (adcs.length === 0) {
      throw new HttpErrors.UnprocessableEntity(
        'Can not find the ADC associated with Application ' + application.id,
      );
    }
    params.adc = adcs[0];

    let service = services[0];

    params.service = service;

    if (service.pool) {
      let pool = await this.poolRepository.findById(service.pool);
      params.pool = pool;
      params.members = await this.poolRepository.members(pool.id).find();
    }

    if (service.endpointpolicy) {
      params.endpointpolicy = await this.endpointpolicyRepository.findById(
        service.endpointpolicy,
      );

      if (params.endpointpolicy) {
        params.rules = await this.ruleRepository.find({
          where: {
            id: {
              inq: (<Endpointpolicy>params.endpointpolicy).rules,
            },
          },
        });
        let rules = <Rule[]>params.rules;
        for (let rule of rules) {
          rule.conditions = await this.ruleRepository
            .conditions(rule.id)
            .find();
          rule.actions = await this.ruleRepository.actions(rule.id).find();
        }
        params.wafs = await this.wafpolicyRepository.find();
      }
    }

    let req = new AS3DeployRequest(params);
    return await this.as3Service.deploy(AS3_HOST, AS3_PORT, req);
  }
}
