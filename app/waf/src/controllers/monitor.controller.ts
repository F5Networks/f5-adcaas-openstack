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

import {Filter, repository} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  patch,
  del,
  requestBody,
  HttpErrors,
  RequestContext,
  RestBindings,
} from '@loopback/rest';
import {Monitor, Pool, Member} from '../models';
import {
  MonitorRepository,
  PoolRepository,
  MemberRepository,
  PoolMonitorAssociationRepository,
  MemberMonitorAssociationRepository,
} from '../repositories';
import {Schema, Response, CollectionResponse} from '.';
import {BaseController} from './base.controller';
import {inject} from '@loopback/core';

const prefix = '/adcaas/v1';
const createDesc: string = 'Monitor resource that need to be created';
const updateDesc: string =
  'Monitor resource properties that need to be updated';

export class MonitorController extends BaseController {
  constructor(
    @repository(MonitorRepository)
    public monitorRepository: MonitorRepository,
    @repository(PoolRepository)
    public poolRepository: PoolRepository,
    @repository(MemberRepository)
    public memberRepository: MemberRepository,
    @repository(PoolMonitorAssociationRepository)
    public poolMonitorAssociationRepository: PoolMonitorAssociationRepository,
    @repository(MemberMonitorAssociationRepository)
    public memberMonitorAssociationRepository: MemberMonitorAssociationRepository,
    @inject(RestBindings.Http.CONTEXT)
    protected reqCxt: RequestContext,
  ) {
    super(reqCxt);
  }

  @post(prefix + '/monitors', {
    responses: {
      '200': Schema.response(Monitor, 'Successfully create Monitor resource'),
      '400': Schema.badRequest('Invalid Monitor resource'),
      '422': Schema.unprocessableEntity('Unprocessable Monitor resource'),
    },
  })
  async create(
    @requestBody(Schema.createRequest(Monitor, createDesc))
    reqBody: Partial<Monitor>,
  ): Promise<Response> {
    reqBody.tenantId = await this.tenantId;
    const data = await this.monitorRepository.create(reqBody);
    return new Response(Monitor, data);
  }

  @get(prefix + '/monitors', {
    responses: {
      '200': Schema.collectionResponse(
        Monitor,
        'Successfully retrieve Monitor resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Monitor)) filter?: Filter,
  ): Promise<CollectionResponse> {
    let data = await this.monitorRepository.find(filter, {
      tenantId: await this.tenantId,
    });
    return new CollectionResponse(Monitor, data);
  }

  @get(prefix + '/monitors/{monitorId}', {
    responses: {
      responses: {
        '200': Schema.response(Monitor, 'Successfully retrieve Pool resource'),
        '404': Schema.notFound('Can not find Pool resource'),
      },
    },
  })
  async findById(
    @param(Schema.pathParameter('monitorId', 'Monitor resource ID'))
    id: string,
  ): Promise<Response> {
    const data = await this.monitorRepository.findById(id, undefined, {
      tenantId: await this.tenantId,
    });
    return new Response(Monitor, data);
  }

  @patch(prefix + '/monitors/{monitorId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully update Monitor resource'),
      '404': Schema.notFound('Can not find Monitor resource'),
    },
  })
  async updateById(
    @param(Schema.pathParameter('monitorId', 'Monitor resource ID'))
    id: string,
    @requestBody(Schema.updateRequest(Monitor, updateDesc))
    monitor: Monitor,
  ): Promise<void> {
    await this.monitorRepository.updateById(id, monitor, {
      tenantId: await this.tenantId,
    });
  }

  @del(prefix + '/monitors/{monitorId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete Monitor resource'),
      '404': Schema.notFound('Can not find Monitor resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('monitorId', 'Monitor resource ID'))
    id: string,
  ): Promise<void> {
    await this.monitorRepository.deleteById(id, {
      tenantId: await this.tenantId,
    });
  }

  @post(prefix + '/monitors/{monitorId}/pools/{poolId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully associate Pool and Monitor'),
      '404': Schema.notFound('Cannot find Pool resource or Monitor resource'),
    },
  })
  async associatePoolMonitor(
    @param(Schema.pathParameter('monitorId', 'Pool resource ID'))
    monitorId: string,
    @param(Schema.pathParameter('poolId', 'Pool resource ID'))
    poolId: string,
  ): Promise<void> {
    await this.poolRepository.findById(poolId, undefined, {
      tenantId: await this.tenantId,
    });
    await this.monitorRepository.findById(monitorId, undefined, {
      tenantId: await this.tenantId,
    });
    await this.poolMonitorAssociationRepository.create({
      poolId: poolId,
      monitorId: monitorId,
    });
  }

  @get(prefix + '/monitors/{monitorId}/pools', {
    responses: {
      '200': Schema.collectionResponse(
        Pool,
        'Successfully retrieve Pool resources',
      ),
    },
  })
  async findPools(
    @param(Schema.pathParameter('monitorId', 'Monitor resource ID'))
    id: string,
  ): Promise<CollectionResponse> {
    let assocs = await this.poolMonitorAssociationRepository.find({
      where: {
        monitorId: id,
      },
    });

    let poolIds = assocs.map(({poolId}) => poolId);
    return new CollectionResponse(
      Pool,
      await this.poolRepository.find(
        {
          where: {
            id: {
              inq: poolIds,
            },
          },
        },
        {tenantId: await this.tenantId},
      ),
    );
  }

  @get(prefix + '/monitors/{monitorId}/pools/{poolId}', {
    responses: {
      '200': Schema.response(Pool, 'Successfully retrieve Pool resource'),
    },
  })
  async findPool(
    @param(Schema.pathParameter('poolId', 'Pool resource ID'))
    poolId: string,
    @param(Schema.pathParameter('monitorId', 'Pool resource ID'))
    monitorId: string,
  ): Promise<Response> {
    let assocs = await this.poolMonitorAssociationRepository.find({
      where: {
        poolId: poolId,
        monitorId: monitorId,
      },
    });

    if (assocs.length === 0) {
      throw new HttpErrors.NotFound('Cannot find association.');
    } else {
      return new Response(
        Pool,
        await this.poolRepository.findById(assocs[0].poolId, undefined, {
          tenantId: await this.tenantId,
        }),
      );
    }
  }

  @del(prefix + '/monitors/{monitorId}/pools/{poolId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully deassociate Pool and Monitor '),
    },
  })
  async deassociatePoolMonitor(
    @param(Schema.pathParameter('monitorId', 'Pool resource ID'))
    monitorId: string,
    @param(Schema.pathParameter('poolId', 'Pool resource ID'))
    poolId: string,
  ): Promise<void> {
    await this.poolRepository.findById(poolId, undefined, {
      tenantId: await this.tenantId,
    });
    await this.monitorRepository.findById(monitorId, undefined, {
      tenantId: await this.tenantId,
    });
    await this.poolMonitorAssociationRepository.deleteAll({
      poolId: poolId,
      monitorId: monitorId,
    });
  }

  @post(prefix + '/monitors/{monitorId}/members/{memberId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully associate Member and Monitor'),
      '404': Schema.notFound('Cannot find Member or Monitor resource'),
    },
  })
  async associateMemberMonitor(
    @param(Schema.pathParameter('monitorId', 'Monitor resource ID'))
    monitorId: string,
    @param(Schema.pathParameter('memberId', 'Member resource ID'))
    memberId: string,
  ): Promise<void> {
    await this.memberRepository.findById(memberId, undefined, {
      tenantId: await this.tenantId,
    });
    await this.monitorRepository.findById(monitorId, undefined, {
      tenantId: await this.tenantId,
    });
    await this.memberMonitorAssociationRepository.create({
      memberId: memberId,
      monitorId: monitorId,
    });
  }

  @get(prefix + '/monitors/{monitorId}/members', {
    responses: {
      '200': Schema.collectionResponse(
        Member,
        'Successfully retrieve Member resources',
      ),
    },
  })
  async findMembers(
    @param(Schema.pathParameter('monitorId', 'Monitor resource ID'))
    id: string,
  ): Promise<CollectionResponse> {
    let assocs = await this.memberMonitorAssociationRepository.find({
      where: {
        monitorId: id,
      },
    });

    let memberIds = assocs.map(({memberId}) => memberId);
    return new CollectionResponse(
      Member,
      await this.memberRepository.find(
        {
          where: {
            id: {
              inq: memberIds,
            },
          },
        },
        {tenantId: await this.tenantId},
      ),
    );
  }

  @get(prefix + '/monitors/{monitorId}/members/{memberId}', {
    responses: {
      '200': Schema.response(
        Monitor,
        'Successfully retrieve  Member resources',
      ),
      '404': Schema.notFound('Cannot find assoociation or Member resource'),
    },
  })
  async findMember(
    @param(Schema.pathParameter('memberId', 'Member resource ID'))
    memberId: string,
    @param(Schema.pathParameter('monitorId', 'Monitor resource ID'))
    monitorId: string,
  ): Promise<Response> {
    let assocs = await this.memberMonitorAssociationRepository.find({
      where: {
        memberId: memberId,
        monitorId: monitorId,
      },
    });

    if (assocs.length === 0) {
      throw new HttpErrors.NotFound('Cannot find association.');
    } else {
      return new Response(
        Member,
        await this.memberRepository.findById(assocs[0].memberId, undefined, {
          tenantId: await this.tenantId,
        }),
      );
    }
  }

  @del(prefix + '/monitors/{monitorId}/members/{memberId}', {
    responses: {
      '204': Schema.emptyResponse(
        'Successfully deassociate Member and Monitor',
      ),
    },
  })
  async deassociateMemberMonitor(
    @param(Schema.pathParameter('monitorId', 'Monitor resource ID'))
    monitorId: string,
    @param(Schema.pathParameter('memberId', 'Member resource ID'))
    memberId: string,
  ): Promise<void> {
    await this.memberRepository.findById(memberId, undefined, {
      tenantId: await this.tenantId,
    });
    await this.monitorRepository.findById(monitorId, undefined, {
      tenantId: await this.tenantId,
    });
    await this.memberMonitorAssociationRepository.deleteAll({
      memberId: memberId,
      monitorId: monitorId,
    });
  }
}
