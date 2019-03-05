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
import {Pool, Member} from '../models';
import {PoolRepository, MemberRepository} from '../repositories';

const prefix = '/adcaas/v1';

export class PoolController {
  constructor(
    @repository(PoolRepository)
    public poolRepository: PoolRepository,
    @repository(MemberRepository)
    public memberRepository: MemberRepository,
  ) {}

  @post(prefix + '/pools', {
    responses: {
      '200': {
        description: 'Pool model instance',
        content: {'application/json': {schema: {'x-ts-type': Pool}}},
      },
    },
  })
  async create(@requestBody() pool: Pool): Promise<Pool> {
    return await this.poolRepository.create(pool);
  }

  @get(prefix + '/pools/count', {
    responses: {
      '200': {
        description: 'Pool model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Pool)) where?: Where,
  ): Promise<Count> {
    return await this.poolRepository.count(where);
  }

  @get(prefix + '/pools', {
    responses: {
      '200': {
        description: 'Array of Pool model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Pool}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Pool)) filter?: Filter,
  ): Promise<Pool[]> {
    return await this.poolRepository.find(filter);
  }

  @patch(prefix + '/pools', {
    responses: {
      '200': {
        description: 'Pool PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() pool: Pool,
    @param.query.object('where', getWhereSchemaFor(Pool)) where?: Where,
  ): Promise<Count> {
    return await this.poolRepository.updateAll(pool, where);
  }

  @get(prefix + '/pools/{id}', {
    responses: {
      '200': {
        description: 'Pool model instance',
        content: {'application/json': {schema: {'x-ts-type': Pool}}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Pool> {
    return await this.poolRepository.findById(id);
  }

  @patch(prefix + '/pools/{id}', {
    responses: {
      '204': {
        description: 'Pool PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() pool: Pool,
  ): Promise<void> {
    await this.poolRepository.updateById(id, pool);
  }

  @put(prefix + '/pools/{id}', {
    responses: {
      '204': {
        description: 'Pool PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() pool: Pool,
  ): Promise<void> {
    await this.poolRepository.replaceById(id, pool);
  }

  @del(prefix + '/pools/{id}', {
    responses: {
      '204': {
        description: 'Pool DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.poolRepository.deleteById(id);
  }

  /**
   * These member control functions are moved to pool controller,
   * it is because of this issues:
   * https://github.com/strongloop/loopback/issues/4142
   */

  @get(prefix + '/members/count', {
    responses: {
      '200': {
        description: 'Member model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async countMembers(
    @param.query.object('where', getWhereSchemaFor(Member)) where?: Where,
  ): Promise<Count> {
    return await this.memberRepository.count(where);
  }

  @get(prefix + '/members', {
    responses: {
      '200': {
        description: 'Array of Member model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Member}},
          },
        },
      },
    },
  })
  async findMembers(
    @param.query.object('filter', getFilterSchemaFor(Member)) filter?: Filter,
  ): Promise<Member[]> {
    return await this.memberRepository.find(filter);
  }

  @post(prefix + '/pools/{pool_id}/members', {
    responses: {
      '200': {
        description: 'Member add to Pool success',
        content: {'application/json': {schema: {'x-ts-type': Member}}},
      },
    },
  })
  async createPoolMember(
    @param.path.string('pool_id') pool_id: string,
    @requestBody() member: Partial<Member>,
  ): Promise<Member> {
    return await this.poolRepository.members(pool_id).create(member);
  }

  @get(prefix + '/pools/{pool_id}/members/{member_id}', {
    responses: {
      '200': {
        description: 'Member model instance',
        content: {'application/json': {schema: {'x-ts-type': Member}}},
      },
    },
  })
  async getMemberByID(
    @param.path.string('pool_id') pool_id: string,
    @param.path.string('member_id') member_id: string,
  ): Promise<Member> {
    const result = await this.poolRepository
      .members(pool_id)
      .find({where: {id: member_id}});
    return result[0];
  }

  @get(prefix + '/pools/{pool_id}/members', {
    responses: {
      '200': {
        description: 'Array of Member model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Member}},
          },
        },
      },
    },
  })
  async getMembers(
    @param.path.string('pool_id') pool_id: string,
  ): Promise<Member[]> {
    return await this.poolRepository.members(pool_id).find();
  }

  @del(prefix + '/pools/{pool_id}/members/{member_id}', {
    responses: {
      '204': {
        description: 'Member DELETE success',
      },
    },
  })
  async deleteMemberByID(
    @param.path.string('pool_id') pool_id: string,
    @param.path.string('member_id') member_id: string,
  ) {
    await this.poolRepository.members(pool_id).delete({id: member_id});
  }

  @put(prefix + '/pools/{pool_id}/members/{member_id}', {
    responses: {
      '200': {
        description: 'Member model instance',
        content: {'application/json': {schema: {'x-ts-type': Member}}},
      },
    },
  })
  async updateMemberByID(
    @param.path.string('pool_id') pool_id: string,
    @param.path.string('member_id') member_id: string,
    @requestBody() member: Partial<Member>,
  ): Promise<Count> {
    return await this.poolRepository
      .members(pool_id)
      .patch(member, {id: member_id});
  }
}
