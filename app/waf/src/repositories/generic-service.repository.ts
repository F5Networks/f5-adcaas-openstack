import { DefaultCrudRepository } from '@loopback/repository';
import { GenericService } from '../models';
import { DbDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class GenericServiceRepository extends DefaultCrudRepository<
  GenericService,
  typeof GenericService.prototype.class
  > {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(GenericService, dataSource);
  }
}
