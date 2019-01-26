import {DefaultCrudRepository} from '@loopback/repository';
import {Pool} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class PoolRepository extends DefaultCrudRepository<
  Pool,
  typeof Pool.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Pool, dataSource);
  }
}
