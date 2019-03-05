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
import uuid = require('uuid');

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

  @post(prefix + '/applications', {
    responses: {
      '200': {
        description: 'Application model instance',
        content: {'application/json': {schema: {'x-ts-type': Application}}},
      },
    },
  })
  async create(
    @requestBody() application: Partial<Application>,
  ): Promise<Application> {
    if (!application.id) {
      application.id = uuid();
    }

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
      '200': {
        description: 'Array of Application model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Application}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Application))
    filter?: Filter,
  ): Promise<Application[]> {
    return await this.applicationRepository.find(filter);
  }

  @patch(prefix + '/applications', {
    responses: {
      '200': {
        description: 'Application PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() application: Partial<Application>,
    @param.query.object('where', getWhereSchemaFor(Application)) where?: Where,
  ): Promise<Count> {
    return await this.applicationRepository.updateAll(application, where);
  }

  @get(prefix + '/applications/{id}', {
    responses: {
      '200': {
        description: 'Application model instance',
        content: {'application/json': {schema: {'x-ts-type': Application}}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Application> {
    return await this.applicationRepository.findById(id);
  }

  @patch(prefix + '/applications/{id}', {
    responses: {
      '204': {
        description: 'Application PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() application: Partial<Application>,
  ): Promise<void> {
    await this.applicationRepository.updateById(id, application);
  }

  @put(prefix + '/applications/{id}', {
    responses: {
      '204': {
        description: 'Application PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() application: Partial<Application>,
  ): Promise<void> {
    application.id = id;
    await this.applicationRepository.replaceById(id, application);
  }

  @del(prefix + '/applications/{id}', {
    responses: {
      '204': {
        description: 'Application DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.applicationRepository.deleteById(id);
  }

  @post(prefix + '/applications/{id}/deploy', {
    responses: {
      '204': {
        description: 'Application deploy success',
      },
    },
  })
  async deployById(@param.path.string('id') id: string): Promise<Object> {
    let application = await this.applicationRepository.findById(id);

    if (application.services.length === 0) {
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

    let serviceId = application.services[0];
    let service = await this.serviceRepository.findById(serviceId);

    params.service = service;

    if (service.pool) {
      let pool = await this.poolRepository.findById(service.pool);
      params.pool = pool;

      params.members = await this.poolRepository.members(pool.id).find();
    }

    params.service = service;

    if (service.endpointpolicy) {
      params.endpointpolicy = await this.endpointpolicyRepository.findById(
        service.endpointpolicy,
      );

      params.rules = await this.ruleRepository.find({
        where: {
          id: {
            inq: (<Endpointpolicy>params.endpointpolicy).rules,
          },
        },
      });

      params.wafs = await this.wafpolicyRepository.find({
        where: {
          id: {
            inq: (<Array<Rule>>params.rules).map(v => {
              return v.wafpolicy;
            }),
          },
        },
      });
    }

    let req = new AS3DeployRequest(params);
    return await this.as3Service.deploy(AS3_HOST, AS3_PORT, req);
  }
}
