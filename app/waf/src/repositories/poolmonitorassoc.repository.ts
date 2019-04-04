import {DefaultCrudRepository} from '@loopback/repository';
import {PoolMonitorAssociation} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class PoolmonitorassocRepository extends DefaultCrudRepository<
  PoolMonitorAssociation,
  typeof PoolMonitorAssociation.prototype.poolId
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(PoolMonitorAssociation, dataSource);
  }
}
