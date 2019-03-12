// Copyright F5 Networks, Inc. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenAdcData,
  givenAdcTenantAssociationData,
} from '../helpers/database.helpers';
import uuid = require('uuid');

describe('TenantAssociationController', () => {
  let wafapp: WafApplication;
  let client: Client;

  const prefix = '/adcaas/v1';

  before('setupApplication', async () => {
    ({wafapp, client} = await setupApplication());
  });

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
  });

  after(async () => {
    await teardownApplication(wafapp);
  });

  it('post ' + prefix + '/tenants/{tenantId}/adcs/{adcId}', async () => {
    let adc = await givenAdcData(wafapp);
    await client
      .post(prefix + '/tenants/1234/adcs/' + adc.id)
      .send()
      .expect(204);
  });

  it(
    'post ' + prefix + '/tenants/{tenantId}/adcs/{adcId}: non-existing ADC',
    async () => {
      await client
        .post(prefix + '/tenants/1234/adcs/non-existing')
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
        .expect(200);

      expect(response.body.adcs[0]).to.containDeep(toJSON(adc));
    },
  );

  it(
    'get ' + prefix + '/tenants/{id}/adcs: no ADC associated with a tenant',
    async () => {
      await client.get(prefix + '/tenants/' + uuid() + '/adcs').expect(200);
    },
  );

  it(
    'delete' +
      prefix +
      '/tenant/{tenantId}/adcs/{adcId}: deassociate non-existing association',
    async () => {
      await client
        .del(prefix + '/tenants/' + uuid() + '/adcs/' + uuid())
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
        .expect(200);

      await client
        .del(prefix + '/tenants/' + assoc.tenantId + '/adcs/' + assoc.adcId)
        .expect(204);

      await client
        .get(prefix + '/tenants/' + assoc.tenantId + '/adcs/' + assoc.adcId)
        .expect(404);
    },
  );
});
