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

import {Client, expect} from '@loopback/testlab';
import {WafApplication} from '../..';
import {
  setupApplication,
  teardownApplication,
  setupEnvs,
  teardownEnvs,
  setupDepApps,
  teardownDepApps,
} from '../helpers/testsetup-helper';
import {ExpectedData} from '../fixtures/datasources/testrest.datasource';

const prefix = '/adcaas/v1';

describe('PingController', () => {
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

  it('invokes GET ' + prefix + '/ping', async () => {
    const res = await client
      .get(prefix + '/ping')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(res.body).to.containEql({
      greeting: 'Hello from F5 ADCaaS for OpenStack',
    });
  });
});
