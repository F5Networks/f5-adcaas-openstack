import {Monitor} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {CommonRepository} from './common';

export class MonitorRepository extends CommonRepository<
  Monitor,
  typeof Monitor.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Monitor, dataSource);
  }
}
