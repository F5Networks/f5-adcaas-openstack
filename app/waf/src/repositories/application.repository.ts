import {HasManyRepositoryFactory, repository} from '@loopback/repository';
import {CommonRepository} from '.';
import {Application, Service} from '../models';
import {ServiceRepository} from './service.repository';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';

export class ApplicationRepository extends CommonRepository<
  Application,
  typeof Application.prototype.id
> {
  public readonly services: HasManyRepositoryFactory<
    Service,
    typeof Application.prototype.id
  >;
  constructor(
    @inject('datasources.db')
    dataSource: DbDataSource,
    @repository.getter('ServiceRepository')
    getServiceRepository: Getter<ServiceRepository>,
  ) {
    super(Application, dataSource);
    this.services = this.createHasManyRepositoryFactoryFor(
      'services',
      getServiceRepository,
    );
  }
}
