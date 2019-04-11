import {CommonRepository} from '.';
import {Wafpolicy} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class WafpolicyRepository extends CommonRepository<
  Wafpolicy,
  typeof Wafpolicy.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Wafpolicy, dataSource);
  }
}
