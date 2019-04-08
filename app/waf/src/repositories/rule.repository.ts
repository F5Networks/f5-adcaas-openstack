import {HasManyRepositoryFactory, repository} from '@loopback/repository';
import {Rule, Condition, Action} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {ConditionRepository} from './condition.repository';
import {ActionRepository} from './action.repository';
import {CommonRepository} from './common';
export class RuleRepository extends CommonRepository<
  Rule,
  typeof Rule.prototype.id
> {
  public readonly conditions: HasManyRepositoryFactory<
    Condition,
    typeof Rule.prototype.id
  >;
  public readonly actions: HasManyRepositoryFactory<
    Action,
    typeof Rule.prototype.id
  >;
  constructor(
    @inject('datasources.db')
    dataSource: DbDataSource,
    @repository.getter('ConditionRepository')
    getConditionRepository: Getter<ConditionRepository>,
    @repository.getter('ActionRepository')
    getActionRepository: Getter<ActionRepository>,
  ) {
    super(Rule, dataSource);
    this.conditions = this.createHasManyRepositoryFactoryFor(
      'conditions',
      getConditionRepository,
    );

    this.actions = this.createHasManyRepositoryFactoryFor(
      'actions',
      getActionRepository,
    );
  }
}
