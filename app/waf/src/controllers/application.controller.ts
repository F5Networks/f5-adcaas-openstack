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
import {Application, Adc, Wafpolicy, AS3DeployRequest,Rule} from '../models';
import {
  ApplicationRepository,
  AdcRepository,
  TenantAssociationRepository,
  ServiceRepository,
  WafpolicyRepository,
  EndpointpolicyRepository,
  RuleRepository,
} from '../repositories';
import {AS3Service} from '../services';
import uuid = require('uuid');
import { isNullOrUndefined } from 'util';

const AS3_HOST: string = process.env.AS3_HOST || '10.128.0.149';
const AS3_PORT: number = Number(process.env.AS3_PORT) || 443;

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
    @repository(WafpolicyRepository)
    public wafpolicyRepository: WafpolicyRepository,
    @repository(EndpointpolicyRepository)
    public endpointpolicyRepository: EndpointpolicyRepository,
    @repository(RuleRepository)
    public ruleRepository: RuleRepository,
    @inject('services.AS3Service') private as3Service: AS3Service,
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
    if (application.wafpolicyId) {
      await this.wafpolicyRepository.findById(application.wafpolicyId);
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

    let tenantAssoc = await this.tenantAssociationRepository.findById(
      // application.tenant_id,
      'default',
    );

    let adc = await this.adcRepository.findById(tenantAssoc.adcId);

    let params: {[key: string]: Object} = {
      adc: adc,
      application: application,
    };

    let rules = [];
    let wafs = [];
    if (application.services.length > 0) {
      let serviceId = application.services[0];
      let service = await this.serviceRepository.findById(serviceId);
      if (service) {
        params.service = service;
        let endpointpolicyId = service.endpointpolicy;
        if (endpointpolicyId != null) {
          let endpointpolicy = await this.endpointpolicyRepository.findById(endpointpolicyId);
          if (endpointpolicy) {
            params.endpointpolicy = endpointpolicy;
            if (endpointpolicy.rules!=null) {
              for (let ruleId of endpointpolicy.rules) {
                let rule = await this.ruleRepository.findById(ruleId);
		            if (rule) {
                  let wafId = rule.wafpolicy;
		              if (wafId != null && wafId != "") { 	
		     	          let waf = await this.wafpolicyRepository.findById(wafId);
		     	          if (waf) {
		 		              wafs.push(waf);
		     	          }
	       	        }			
                  rules.push(rule);
          	    } 
              }
              params.rules=rules;
              params.wafs=wafs; 
            }
          }
          
        }
      }
    } 	

    /*if (application.wafpolicyId) {
      let waf = await this.wafpolicyRepository.findById(
        application.wafpolicyId,
      );
      if (waf) {
        params.waf = waf;
      }
    }*/

    let req = new AS3DeployRequest(params);
    console.log('zhaoqin req is ' + JSON.stringify(req));
    return await this.as3Service.deploy(AS3_HOST,AS3_PORT, req);
  }
}
