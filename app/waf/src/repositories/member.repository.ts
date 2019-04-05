import {Member} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {CommonRepository} from './common';

export class MemberRepository extends CommonRepository<
  Member,
  typeof Member.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Member, dataSource);
  }
}
