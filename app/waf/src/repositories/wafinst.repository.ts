import {DefaultCrudRepository} from '@loopback/repository';
import {WafInst} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class WafInstRepository extends DefaultCrudRepository<
  WafInst,
  typeof WafInst.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(WafInst, dataSource);
  }
}
