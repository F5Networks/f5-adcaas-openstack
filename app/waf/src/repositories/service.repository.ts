import {CommonRepository} from '.';
import {Service} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ServiceRepository extends CommonRepository<
  Service,
  typeof Service.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Service, dataSource);
  }
}
