import {DefaultCrudRepository} from '@loopback/repository';
import {Endpointpolicy} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class EndpointpolicyRepository extends DefaultCrudRepository<
  Endpointpolicy,
  typeof Endpointpolicy.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Endpointpolicy, dataSource);
  }
}
