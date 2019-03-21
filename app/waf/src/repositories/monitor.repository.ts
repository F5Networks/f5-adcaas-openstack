import {DefaultCrudRepository} from '@loopback/repository';
import {Monitor} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class MonitorRepository extends DefaultCrudRepository<
  Monitor,
  typeof Monitor.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Monitor, dataSource);
  }
}
