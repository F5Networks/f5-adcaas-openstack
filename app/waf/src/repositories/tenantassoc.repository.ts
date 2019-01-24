import {DefaultCrudRepository} from '@loopback/repository';
import {TenantAssociation} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class TenantAssociationRepository extends DefaultCrudRepository<
  TenantAssociation,
  typeof TenantAssociation.prototype.tenantId
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(TenantAssociation, dataSource);
  }
}
