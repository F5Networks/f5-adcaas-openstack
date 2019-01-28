import {DefaultCrudRepository} from '@loopback/repository';
import {Service} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ServiceRepository extends DefaultCrudRepository<
  Service,
  typeof Service.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Service, dataSource);
  }
}
