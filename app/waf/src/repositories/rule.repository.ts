import {DefaultCrudRepository} from '@loopback/repository';
import {Rule} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class RuleRepository extends DefaultCrudRepository<
  Rule,
  typeof Rule.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Rule, dataSource);
  }
}
