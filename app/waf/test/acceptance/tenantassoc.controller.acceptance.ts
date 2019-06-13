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

// Copyright F5 Networks, Inc. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {
  setupApplication,
  teardownApplication,
  TestingApplication,
  setupRestAppAndClient,
  RestApplicationPort,
  setupEnvs,
  teardownRestAppAndClient,
  teardownEnvs,
} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenAdcData,
  givenAdcTenantAssociationData,
} from '../helpers/database.helpers';
import uuid = require('uuid');
import {
  MockKeyStoneController,
  ExpectedData,
} from '../fixtures/controllers/mocks/mock.openstack.controller';

describe('TenantAssociationController', () => {
  let wafapp: WafApplication;
  let client: Client;
  let mockKeystoneApp: TestingApplication;

  const prefix = '/adcaas/v1';

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

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
  });

  after(async () => {
    await teardownApplication(wafapp);
    teardownRestAppAndClient(mockKeystoneApp);
    teardownEnvs();
  });

  it('post ' + prefix + '/tenants/{tenantId}/adcs/{adcId}', async () => {
    let adc = await givenAdcData(wafapp);
    await client
      .post(prefix + '/tenants/1234/adcs/' + adc.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send()
      .expect(204);
  });

  it(
    'post ' + prefix + '/tenants/{tenantId}/adcs/{adcId}: non-existing ADC',
    async () => {
      await client
        .post(prefix + '/tenants/1234/adcs/non-existing')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send()
        .expect(404);
    },
  );

  it(
    'get ' + prefix + '/tenants/{id}/adcs: find ADCs associated with a tenant',
    async () => {
      let adc = await givenAdcData(wafapp);
      let assoc = await givenAdcTenantAssociationData(wafapp, {adcId: adc.id});

      let response = await client
        .get(prefix + '/tenants/' + assoc.tenantId + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      expect(response.body.adcs[0]).to.containDeep(toJSON(adc));
    },
  );

  it(
    'get ' + prefix + '/tenants/{id}/adcs: no ADC associated with a tenant',
    async () => {
      await client
        .get(prefix + '/tenants/' + uuid() + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);
    },
  );

  it(
    'delete' +
      prefix +
      '/tenant/{tenantId}/adcs/{adcId}: deassociate non-existing association',
    async () => {
      await client
        .del(prefix + '/tenants/' + uuid() + '/adcs/' + uuid())
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(204);
    },
  );

  it(
    'delete ' +
      prefix +
      '/tenants/{tenantId}/adcs/{adcId}: deassociate ADC from a tenant',
    async () => {
      let adc = await givenAdcData(wafapp);
      let assoc = await givenAdcTenantAssociationData(wafapp, {adcId: adc.id});

      await client
        .get(prefix + '/tenants/' + assoc.tenantId + '/adcs/' + assoc.adcId)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      await client
        .del(prefix + '/tenants/' + assoc.tenantId + '/adcs/' + assoc.adcId)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(204);

      await client
        .get(prefix + '/tenants/' + assoc.tenantId + '/adcs/' + assoc.adcId)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(404);
    },
  );
});
