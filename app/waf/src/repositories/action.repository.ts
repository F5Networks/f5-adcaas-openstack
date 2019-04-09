import {Action} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {CommonRepository} from './common';

export class ActionRepository extends CommonRepository<
  Action,
  typeof Action.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Action, dataSource);
  }
}
