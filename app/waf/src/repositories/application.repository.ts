import {HasManyRepositoryFactory, repository} from '@loopback/repository';
import {CommonRepository} from '.';
import {Application, Declaration, Service} from '../models';
import {DeclarationRepository, ServiceRepository} from '.';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';

export class ApplicationRepository extends CommonRepository<
  Application,
  typeof Application.prototype.id
> {
  public readonly declarations: HasManyRepositoryFactory<
    Declaration,
    typeof Application.prototype.id
  >;

  public readonly services: HasManyRepositoryFactory<
    Service,
    typeof Application.prototype.id
  >;

  constructor(
    @inject('datasources.db')
    dataSource: DbDataSource,
    @repository.getter('DeclarationRepository')
    getDeclarationRepository: Getter<DeclarationRepository>,
    @repository.getter('ServiceRepository')
    getServiceRepository: Getter<ServiceRepository>,
  ) {
    super(Application, dataSource);

    this.declarations = this.createHasManyRepositoryFactoryFor(
      'declarations',
      getDeclarationRepository,
    );

    this.services = this.createHasManyRepositoryFactoryFor(
      'services',
      getServiceRepository,
    );
  }
}
