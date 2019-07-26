/**
 * Copyright 2019 F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {CommonEntity} from '../models';
import {
  DataObject,
  Options,
  DefaultCrudRepository,
  EntityNotFoundError,
  WhereBuilder,
  Filter,
  Entity,
} from '@loopback/repository';
import uuid = require('uuid');
import {factory} from '../log4ts';
import {juggler} from '@loopback/service-proxy';
import {RequestContext} from '@loopback/rest';
export class CommonRepository<
  T extends CommonEntity,
  ID
> extends DefaultCrudRepository<T, ID> {
  private logger = factory.getLogger(
    'Unknown: repository.common.CommonRepository',
  );
  constructor(
    entityClass: typeof Entity & {
      prototype: T;
    },
    dataSource: juggler.DataSource,
    protected reqCxt: RequestContext,
  ) {
    super(entityClass, dataSource);
    if (reqCxt) {
      this.logger = factory.getLogger(
        reqCxt.name + ': repository.common.CommonRepository',
      );
    }
  }

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
    this.logger.debug('update resource ' + id);
    let entity = await this.findById(id, undefined, options);
    Object.assign(entity, data, {
      updatedAt: new Date().toISOString(),
    });
    let modelKeys = Object.keys(this.entityClass.definition.properties);
    for (let key of Object.keys(entity)) {
      if (!modelKeys.includes(key)) delete entity[key];
    }
    return super.replaceById(id, entity, options);
  }

  async deleteById(id: ID, options?: Options): Promise<void> {
    let entity = await this.findById(id, undefined, options);

    this.logger.debug('delete resource ' + entity.id);
    return super.deleteById(id, options);
  }
}
