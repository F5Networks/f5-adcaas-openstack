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

import {CommonRepository} from '.';
import {IRule} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {RequestContext, RestBindings} from '@loopback/rest';

export class IRuleRepository extends CommonRepository<
  IRule,
  typeof IRule.prototype.id
> {
  constructor(
    @inject(RestBindings.Http.CONTEXT, {optional: true})
    protected reqCxt: RequestContext,
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(IRule, dataSource, reqCxt);
  }
}
