import {CommonEntity} from '../models';
import {DataObject, Options, DefaultCrudRepository} from '@loopback/repository';
import uuid = require('uuid');

export class CommonRepository<
  T extends CommonEntity,
  ID
> extends DefaultCrudRepository<T, ID> {
  create(data: DataObject<T>, options?: Options): Promise<T> {
    Object.assign(data, {
      id: uuid(),
      createdAt: new Date().toISOString(),
    });

    return super.create(data, options);
  }

  updateById(id: ID, data: DataObject<T>, options?: Options): Promise<void> {
    Object.assign(data, {
      updatedAt: new Date().toISOString(),
    });

    return super.updateById(id, data, options);
  }
}
