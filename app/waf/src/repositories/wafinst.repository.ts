import {WafInst} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {CommonRepository} from './common';

export class WafInstRepository extends CommonRepository<
  WafInst,
  typeof WafInst.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(WafInst, dataSource);
  }
}
