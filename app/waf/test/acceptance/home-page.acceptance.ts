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

// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client} from '@loopback/testlab';
import {WafApplication} from '../..';
import {
  setupApplication,
  teardownApplication,
  teardownEnvs,
  setupEnvs,
  setupDepApps,
  teardownDepApps,
} from '../helpers/testsetup-helper';
import {ExpectedData} from '../fixtures/datasources/testrest.datasource';

describe('HomePage', () => {
  let wafapp: WafApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({wafapp, client} = await setupApplication());
    await setupDepApps();
    setupEnvs();
  });

  after(async () => {
    await teardownApplication(wafapp);
    await teardownDepApps();
    teardownEnvs();
  });

  it('exposes a default home page', async () => {
    await client
      .get('/')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200)
      .expect('Content-Type', /text\/html/);
  });

  it('exposes self-hosted explorer', async () => {
    await client
      .get('/explorer/')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/<title>LoopBack API Explorer/);
  });
});
