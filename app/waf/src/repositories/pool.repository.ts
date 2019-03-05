import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {Pool, Member} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {MemberRepository} from './member.repository';

export class PoolRepository extends DefaultCrudRepository<
  Pool,
  typeof Pool.prototype.id
> {
  public readonly members: HasManyRepositoryFactory<
    Member,
    typeof Pool.prototype.id
  >;
  constructor(
    @inject('datasources.db')
    dataSource: DbDataSource,
    @repository.getter('MemberRepository')
    getMemberRepository: Getter<MemberRepository>,
  ) {
    super(Pool, dataSource);
    this.members = this.createHasManyRepositoryFactoryFor(
      'members',
      getMemberRepository,
    );
  }
}
