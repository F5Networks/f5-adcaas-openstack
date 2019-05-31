import {CommonEntity} from '../models';
import {
  DataObject,
  Options,
  DefaultCrudRepository,
  EntityNotFoundError,
  WhereBuilder,
  Filter,
} from '@loopback/repository';
import uuid = require('uuid');
import {factory} from '../log4ts';

export class CommonRepository<
  T extends CommonEntity,
  ID
> extends DefaultCrudRepository<T, ID> {
  private logger = factory.getLogger('repository.common.CommonRepostory');

  create(data: DataObject<T>, options?: Options): Promise<T> {
    Object.assign(data, {
      id: uuid(),
      createdAt: new Date().toISOString(),
    });

    return super.create(data, options);
  }

  //TODO: Implement count() with tenantId option

  async find(filter?: Filter<T>, options?: Options): Promise<T[]> {
    let f: Filter = filter || {};
    if (options !== undefined && options.tenantId) {
      let tenantId = options.tenantId;
      delete options.tenantId;

      let builder = new WhereBuilder(f.where);
      f.where = builder.and({tenantId: tenantId}).build();
    }
    return super.find(f as Filter<T>, options);
  }

  async findById(id: ID, filter?: Filter<T>, options?: Options): Promise<T> {
    let f: Filter = filter || {};
    let builder = new WhereBuilder(f.where);
    f.where = builder.and({id: id}).build();
    let data = await this.find(f as (Filter<T>), options);
    if (data.length !== 0) {
      this.logger.debug('find resource ' + data[0].id);
      // return the first one we found.
      return data[0];
    } else {
      throw new EntityNotFoundError(this.entityClass.name, id);
    }
  }

  async updateById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<void> {
    let entity = await this.findById(id, undefined, options);

    this.logger.debug('update resource ' + entity.id);
    Object.assign(data, {
      updatedAt: new Date().toISOString(),
    });
    return super.updateById(id, data, options);
  }

  async deleteById(id: ID, options?: Options): Promise<void> {
    let entity = await this.findById(id, undefined, options);

    this.logger.debug('delete resource ' + entity.id);
    return super.deleteById(id, options);
  }
}
