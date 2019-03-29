import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {Endpointpolicy} from '../models';
import {DbDataSource} from '../datasources';
import {Rule} from '../models';
import {inject, Getter} from '@loopback/core';
import {RuleRepository} from './rule.repository';

export class EndpointpolicyRepository extends DefaultCrudRepository<
  Endpointpolicy,
  typeof Endpointpolicy.prototype.id
> {
  public readonly rules: HasManyRepositoryFactory<
    Rule,
    typeof Endpointpolicy.prototype.id
  >;
  constructor(
    @inject('datasources.db')
    dataSource: DbDataSource,
    @repository.getter('RuleRepository')
    getRuleRepository: Getter<RuleRepository>,
  ) {
    super(Endpointpolicy, dataSource);
    this.rules = this.createHasManyRepositoryFactoryFor(
      'rules',
      getRuleRepository,
    );
  }
}
