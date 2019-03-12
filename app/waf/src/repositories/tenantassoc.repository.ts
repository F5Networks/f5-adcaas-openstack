import {DefaultCrudRepository} from '@loopback/repository';
import {AdcTenantAssociation} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AdcTenantAssociationRepository extends DefaultCrudRepository<
  AdcTenantAssociation,
  typeof AdcTenantAssociation.prototype.tenantId
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(AdcTenantAssociation, dataSource);
  }
}
