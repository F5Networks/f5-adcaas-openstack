import {repository} from '@loopback/repository';
import {post, param, get, del, HttpErrors} from '@loopback/rest';
import {Monitor, Member} from '../models';
import {
  MemberMonitorAssociationRepository,
  MemberRepository,
  MonitorRepository,
} from '../repositories';
import {Schema, Response, CollectionResponse} from '.';

const prefix = '/adcaas/v1';

export class MemberMonitorAssociationController {
  constructor(
    @repository(MemberMonitorAssociationRepository)
    public memberMonitorAssociationRepository: MemberMonitorAssociationRepository,
    @repository(MonitorRepository)
    public monitorRepository: MonitorRepository,
    @repository(MemberRepository)
    public memberRepository: MemberRepository,
  ) {}

  @post(prefix + '/members/{memberId}/monitors/{monitorId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully associate Member and Monitor'),
      '404': Schema.notFound('Cannot find Member or Monitor resource'),
    },
  })
  async associateMemberMonitor(
    @param(Schema.pathParameter('memberId', 'Member resource ID'))
    memberId: string,
    @param(Schema.pathParameter('monitorId', 'Monitor resource ID'))
    monitorId: string,
  ): Promise<void> {
    await this.memberRepository.findById(memberId);
    await this.monitorRepository.findById(monitorId);
    await this.memberMonitorAssociationRepository.create({
      memberId: memberId,
      monitorId: monitorId,
    });
  }

  @get(prefix + '/members/{memberId}/monitors', {
    responses: {
      '200': Schema.collectionResponse(
        Monitor,
        'Successfully retrieve Monitor resources',
      ),
    },
  })
  async findMonitors(
    @param(Schema.pathParameter('memberId', 'Member resource ID'))
    id: string,
  ): Promise<CollectionResponse> {
    let assocs = await this.memberMonitorAssociationRepository.find({
      where: {
        memberId: id,
      },
    });

    let monitorIds = assocs.map(({monitorId}) => monitorId);
    return new CollectionResponse(
      Monitor,
      await this.monitorRepository.find({
        where: {
          id: {
            inq: monitorIds,
          },
        },
      }),
    );
  }

  @get(prefix + '/members/{memberId}/monitors/{monitorId}', {
    responses: {
      '200': Schema.response(
        Monitor,
        'Successfully retrieve  Monitor resources',
      ),
      '404': Schema.notFound('Cannot find assoociation or Monitor resource'),
    },
  })
  async findMonitor(
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
        Monitor,
        await this.monitorRepository.findById(assocs[0].monitorId),
      );
    }
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
      await this.memberRepository.find({
        where: {
          id: {
            inq: memberIds,
          },
        },
      }),
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
        await this.memberRepository.findById(assocs[0].memberId),
      );
    }
  }

  @del(prefix + '/members/{memberId}/monitors/{monitorId}', {
    responses: {
      '204': Schema.emptyResponse(
        'Successfully deassociate Member and Monitor',
      ),
    },
  })
  async deassociateMemberMonitor(
    @param(Schema.pathParameter('memberId', 'Member resource ID'))
    memberId: string,
    @param(Schema.pathParameter('monitorId', 'Monitor resource ID'))
    monitorId: string,
  ): Promise<void> {
    await this.memberMonitorAssociationRepository.deleteAll({
      memberId: memberId,
      monitorId: monitorId,
    });
  }
}
