import {DefaultCrudRepository} from '@loopback/repository';
import {Application} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ApplicationRepository extends DefaultCrudRepository<
  Application,
  typeof Application.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Application, dataSource);
  }
}
