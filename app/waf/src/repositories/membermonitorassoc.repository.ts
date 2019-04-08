import {DefaultCrudRepository} from '@loopback/repository';
import {MemberMonitorAssociation} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class MemberMonitorAssociationRepository extends DefaultCrudRepository<
  MemberMonitorAssociation,
  typeof MemberMonitorAssociation.prototype.memberId
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(MemberMonitorAssociation, dataSource);
  }
}
