import {CommonRepository} from '.';
import {Adc} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AdcRepository extends CommonRepository<
  Adc,
  typeof Adc.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Adc, dataSource);
  }
}
