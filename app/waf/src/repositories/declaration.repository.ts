import {CommonRepository} from '.';
import {Declaration} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class DeclarationRepository extends CommonRepository<
  Declaration,
  typeof Declaration.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Declaration, dataSource);
  }
}
