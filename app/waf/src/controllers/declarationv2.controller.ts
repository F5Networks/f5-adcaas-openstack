/**
 * Copyright 2019 F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  post,
  param,
  get,
  del,
  requestBody,
  HttpErrors,
  RequestContext,
  RestBindings,
} from '@loopback/rest';
import {
  Application,
  Declaration,
  Service,
  Endpointpolicy,
  Rule,
  Action,
  Pool,
  Member,
} from '../models';
import {inject, CoreBindings} from '@loopback/core';
import {
  ApplicationRepository,
  PoolRepository,
  PoolMonitorAssocRepository,
  MemberMonitorAssociationRepository,
  MonitorRepository,
  WafpolicyRepository,
  EndpointpolicyRepository,
  ServiceEndpointpolicyAssociationRepository,
  RuleRepository,
} from '../repositories';
import {BaseController, Schema, Response} from '.';
import {factory} from '../log4ts';
import {WafApplication, RepositoryManager} from '../application';

const prefix = '/adcaas/v2';

export class DeclarationControllerV2 extends BaseController {
  protected logger = factory.getLogger('controllers.DeclarationController');

  constructor(
    //Suppress get injection binding exeption by using {optional: true}
    @inject(RestBindings.Http.CONTEXT, {optional: true})
    protected reqCxt: RequestContext,
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private wafapp: WafApplication,
  ) {
    super(reqCxt);
  }

  private async loadApplication(app: Application): Promise<void> {
    let applicationRepository = await RepositoryManager.resolveRepository(
      this.wafapp,
      ApplicationRepository,
    );
    app.services = await applicationRepository.services(app.id).find();

    for (let service of app.services) {
      await this.loadService(service);
    }
  }

  private async loadService(service: Service): Promise<void> {
    if (service.defaultPoolId) {
      let poolRepository = await RepositoryManager.resolveRepository(
        this.wafapp,
        PoolRepository,
      );
      service.defaultPool = await poolRepository.findById(
        service.defaultPoolId,
      );
      await this.loadPool(service.defaultPool);
    }

    let serviceEndpointpolicyAssociationRepository = await RepositoryManager.resolveRepository(
      this.wafapp,
      ServiceEndpointpolicyAssociationRepository,
    );
    let assocs = await serviceEndpointpolicyAssociationRepository.find({
      where: {
        serviceId: service.id,
      },
    });

    let policyIds = assocs.map(({endpointpolicyId}) => endpointpolicyId);
    let endpointpolicyRepository = await RepositoryManager.resolveRepository(
      this.wafapp,
      EndpointpolicyRepository,
    );
    service.policies = await endpointpolicyRepository.find({
      where: {
        id: {
          inq: policyIds,
        },
      },
    });

    for (let policy of service.policies) {
      await this.loadEndpointpolicy(policy);
    }
  }

  private async loadPool(pool: Pool): Promise<void> {
    let poolRepository = await RepositoryManager.resolveRepository(
      this.wafapp,
      PoolRepository,
    );
    pool.members = await poolRepository.members(pool.id).find();

    for (let member of pool.members) {
      await this.loadMember(member);
    }

    let poolMonitorAssociationRepository = await RepositoryManager.resolveRepository(
      this.wafapp,
      PoolMonitorAssocRepository,
    );
    let assocs = await poolMonitorAssociationRepository.find({
      where: {
        poolId: pool.id,
      },
    });

    let monitorRepository = await RepositoryManager.resolveRepository(
      this.wafapp,
      MonitorRepository,
    );
    let monitorIds = assocs.map(({monitorId}) => monitorId);
    pool.monitors = await monitorRepository.find({
      where: {
        id: {
          inq: monitorIds,
        },
      },
    });
  }

  private async loadMember(member: Member): Promise<void> {
    let memberMonitorAssociationRepository = await RepositoryManager.resolveRepository(
      this.wafapp,
      MemberMonitorAssociationRepository,
    );
    let assocs = await memberMonitorAssociationRepository.find({
      where: {
        memberId: member.id,
      },
    });

    let monitorIds = assocs.map(({monitorId}) => monitorId);
    let monitorRepository = await RepositoryManager.resolveRepository(
      this.wafapp,
      MonitorRepository,
    );
    member.monitors = await monitorRepository.find({
      where: {
        id: {
          inq: monitorIds,
        },
      },
    });
  }

  private async loadEndpointpolicy(policy: Endpointpolicy): Promise<void> {
    let endpointpolicyRepository = await RepositoryManager.resolveRepository(
      this.wafapp,
      EndpointpolicyRepository,
    );
    policy.rules = await endpointpolicyRepository.rules(policy.id).find();

    if (policy.rules.length === 0) {
      throw new HttpErrors.UnprocessableEntity(
        'Endpoint Policy ' + policy.id + ' has no rule',
      );
    }

    for (let rule of policy.rules) {
      await this.loadRule(rule);
    }
  }

  private async loadRule(rule: Rule): Promise<void> {
    let ruleRepository = await RepositoryManager.resolveRepository(
      this.wafapp,
      RuleRepository,
    );
    rule.conditions = await ruleRepository.conditions(rule.id).find();
    rule.actions = await ruleRepository.actions(rule.id).find();

    for (let action of rule.actions) {
      await this.loadAction(action);
    }
  }

  private async loadAction(action: Action): Promise<void> {
    if (action.type === 'waf' && action.policy) {
      let wafpolicyRepository = await RepositoryManager.resolveRepository(
        this.wafapp,
        WafpolicyRepository,
      );
      action.wafpolicy = await wafpolicyRepository.findById(action.policy);
    }
  }

  @post(prefix + '/applications/{applicationId}/declarations', {
    responses: {
      '200': Schema.response(
        Declaration,
        'Successfully create Declaration resource',
      ),
      '422': Schema.unprocessableEntity('Fail to create Declaration resource'),
    },
  })
  async create(
    @param(Schema.pathParameter('applicationId', 'Application resource ID'))
    id: string,
    @requestBody(
      Schema.createRequest(
        Declaration,
        'Declaration resource that need to be created',
      ),
    )
    reqBody: Partial<Declaration>,
  ): Promise<Response> {
    // Throws HTTP 404, if application does not exist

    let applicationRepository = await RepositoryManager.resolveRepository(
      this.wafapp,
      ApplicationRepository,
    );
    let app = await applicationRepository.findById(id, undefined, {
      tenantId: await this.tenantId,
    });
    await this.loadApplication(app);

    Object.assign(reqBody, {
      tenantId: app.tenantId,
      content: app.getAS3Declaration(),
    });

    let declaration = await applicationRepository
      .declarations(id)
      .create(reqBody);

    return new Response(Declaration, declaration);
  }

  @get(prefix + '/applications/{applicationId}/declarations/{declarationId}', {
    responses: {
      '200': Schema.response(
        Declaration,
        'Successfully retrieve Declaration resources',
      ),
      '404': Schema.notFound('Can not find Declaration resource'),
    },
  })
  async findByID(
    @param(Schema.pathParameter('applicationId', 'Application resource ID'))
    applicationId: string,
    @param(Schema.pathParameter('declarationId', 'Declaration resource ID'))
    declarationId: string,
  ): Promise<Response> {
    let applicationRepository = await RepositoryManager.resolveRepository(
      this.wafapp,
      ApplicationRepository,
    );
    let declarations = await applicationRepository
      .declarations(applicationId)
      .find({
        where: {
          and: [
            {
              id: declarationId,
            },
            {
              tenantId: await this.tenantId,
            },
          ],
        },
      });

    if (declarations.length === 0) {
      throw new HttpErrors.NotFound('Cannot find Declaration');
    } else {
      return new Response(Declaration, declarations[0]);
    }
  }

  @del(prefix + '/applications/{applicationId}/declarations/{declarationId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete Declaration resource'),
      '404': Schema.notFound('Can not find Declaration resource'),
    },
  })
  async deleteByID(
    @param(Schema.pathParameter('applicationId', 'Application resource ID'))
    applicationId: string,
    @param(Schema.pathParameter('declarationId', 'Declaration resource ID'))
    declarationId: string,
  ) {
    let applicationRepository = await RepositoryManager.resolveRepository(
      this.wafapp,
      ApplicationRepository,
    );
    await applicationRepository
      .declarations(applicationId)
      .delete({and: [{id: declarationId}, {tenantId: await this.tenantId}]});
  }
}
