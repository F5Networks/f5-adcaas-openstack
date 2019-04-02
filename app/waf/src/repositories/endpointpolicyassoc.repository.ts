import {DefaultCrudRepository} from '@loopback/repository';
import {ServiceEndpointpolicyAssociation} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ServiceEndpointpolicyAssociationRepository extends DefaultCrudRepository<
  ServiceEndpointpolicyAssociation,
  typeof ServiceEndpointpolicyAssociation.prototype.endpointpolicyId
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(ServiceEndpointpolicyAssociation, dataSource);
  }
}
