import {DefaultCrudRepository} from '@loopback/repository';
import {Action} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ActionRepository extends DefaultCrudRepository<
  Action,
  typeof Action.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Action, dataSource);
  }
}
