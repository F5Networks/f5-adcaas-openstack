import {DefaultCrudRepository} from '@loopback/repository';
import {Condition} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ConditionRepository extends DefaultCrudRepository<
  Condition,
  typeof Condition.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Condition, dataSource);
  }
}
