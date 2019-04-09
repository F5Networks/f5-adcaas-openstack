import {Condition} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {CommonRepository} from './common';

export class ConditionRepository extends CommonRepository<
  Condition,
  typeof Condition.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Condition, dataSource);
  }
}
