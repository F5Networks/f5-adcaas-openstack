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
  TestingApplication,
  setupRestAppAndClient,
  setupEnvs,
  teardownRestAppAndClient,
  teardownEnvs,
} from '../helpers/testsetup-helper';
import {MockKeyStoneController} from '../fixtures/controllers/mocks/mock.openstack.controller';
import {
  RestApplicationPort,
  ExpectedData,
} from '../fixtures/datasources/testrest.datasource';

const prefix = '/adcaas/v1';

describe('PingController', () => {
  let wafapp: WafApplication;
  let client: Client;
  let mockKeystoneApp: TestingApplication;

  before('setupApplication', async () => {
    ({wafapp, client} = await setupApplication());

    mockKeystoneApp = await (async () => {
      let {restApp} = await setupRestAppAndClient(
        RestApplicationPort.IdentityAdmin,
        MockKeyStoneController,
      );
      return restApp;
    })();
    setupEnvs();
  });

  after(async () => {
    await teardownApplication(wafapp);
    teardownRestAppAndClient(mockKeystoneApp);
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
