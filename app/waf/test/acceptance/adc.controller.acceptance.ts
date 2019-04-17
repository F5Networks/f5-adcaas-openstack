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
  teardownRestAppAndClient,
} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenAdcData,
  createAdcObject,
  givenAdcTenantAssociationData,
} from '../helpers/database.helpers';
import {Adc} from '../../src/models';
import uuid = require('uuid');
import {
  MockKeyStoneController,
  MockNovaController,
  MockNeutronController,
  ExpectedData,
  ShouldResponseWith,
} from '../fixtures/controllers/mocks/mock.openstack.controller';

describe('AdcController', () => {
  let wafapp: WafApplication;
  let client: Client;

  let mockKeystoneApp: TestingApplication;
  let mockNovaApp: TestingApplication;
  let mockNeutronApp: TestingApplication;

  const prefix = '/adcaas/v1';

  let envs: {[key: string]: string} = {
    OS_AUTH_URL: 'http://localhost:35357/v2.0',
    OS_USERNAME: 'wafaas',
    OS_PASSWORD: '91153c85b8dd4147',
    OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
    OS_DOMAIN_NAME: 'Default',
    OS_REGION_NAME: 'RegionOne',
    OS_AVAILABLE_ZONE: 'nova',
  };

  before('setupApplication', async () => {
    mockKeystoneApp = await (async () => {
      let {restApp} = await setupRestAppAndClient(
        RestApplicationPort.IdentityAdmin,
        MockKeyStoneController,
      );
      return restApp;
    })();

    mockNovaApp = await (async () => {
      let {restApp} = await setupRestAppAndClient(
        RestApplicationPort.Nova,
        MockNovaController,
      );
      return restApp;
    })();

    mockNeutronApp = await (async () => {
      let {restApp} = await setupRestAppAndClient(
        RestApplicationPort.Neutron,
        MockNeutronController,
      );
      return restApp;
    })();

    ({wafapp, client} = await setupApplication());
    ShouldResponseWith({});
  });

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
  });

  let setupEnvs = async () => {
    process.env.PRODUCT_RELEASE = '1';
    for (let env of Object.keys(envs)) {
      process.env[env] = envs[env];
    }
  };

  let teardownEnvs = async () => {
    delete process.env['PRODUCT_RELEASE'];
    for (let env of Object.keys(envs)) {
      delete process.env[env];
    }
  };

  after(async () => {
    await teardownApplication(wafapp);
    teardownRestAppAndClient(mockKeystoneApp);
    teardownRestAppAndClient(mockNovaApp);
    teardownRestAppAndClient(mockNeutronApp);
  });

  it('post ' + prefix + '/adcs: with no id', async () => {
    const adc = new Adc(createAdcObject());

    const response = await client
      .post(prefix + '/adcs')
      .send(adc)
      .expect(200);

    expect(response.body.adc).to.containDeep(toJSON(adc));
  });

  it('get ' + prefix + '/adcs: of all', async () => {
    const adc = await givenAdcData(wafapp);

    let response = await client
      .get(prefix + '/adcs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.adcs).to.containDeep([toJSON(adc)]);
  });

  it('get ' + prefix + '/adcs: with filter string', async () => {
    const adc = await givenAdcData(wafapp);

    let response = await client
      .get(prefix + '/adcs')
      .query({filter: {where: {id: adc.id}}})
      .expect(200);

    expect(response.body.adcs).to.containDeep([toJSON(adc)]);
  });

  it('get ' + prefix + '/adcs/count', async () => {
    let response = await client.get(prefix + '/adcs/count').expect(200);
    expect(response.body.count).to.eql(0);

    const adc = await givenAdcData(wafapp);

    response = await client
      .get(prefix + '/adcs/count')
      .query({where: {id: adc.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/adcs/{id}: selected item', async () => {
    await givenAdcData(wafapp);
    const adc = await givenAdcData(wafapp);

    let response = await client.get(prefix + '/adcs/' + adc.id).expect(200);

    expect(response.body.adc).to.containDeep(toJSON(adc));
  });

  it('get ' + prefix + '/adcs/{id}: not found', async () => {
    await client.get(prefix + '/adcs/' + uuid()).expect(404);
  });

  it('patch ' + prefix + '/adcs/{id}: existing item', async () => {
    const patched_name = {name: 'new adc name'};
    const adc = await givenAdcData(wafapp);

    await client
      .patch(prefix + '/adcs/' + adc.id)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/adcs/{id}: non-existing item', async () => {
    const patched_name = {name: 'new adc name'};
    await client
      .patch(prefix + '/adcs/' + uuid())
      .send(patched_name)
      .expect(404);
  });

  it('delete ' + prefix + '/adcs/{id}: non-existing item', async () => {
    await client.del(prefix + '/adcs/' + uuid()).expect(404);
  });

  it('delete ' + prefix + '/adcs/{id}: existing item', async () => {
    const adc = await givenAdcData(wafapp);

    await client.del(prefix + '/adcs/' + adc.id).expect(204);
  });

  it(
    'get ' + prefix + '/adcs/{adcId}/adcs: find Tenants associated with ADC',
    async () => {
      let adc = await givenAdcData(wafapp);
      let assoc = await givenAdcTenantAssociationData(wafapp, {
        adcId: adc.id,
        tenantId: '12345678',
      });

      let response = await client
        .get(prefix + '/adcs/' + adc.id + '/tenants')
        .expect(200);

      expect(response.body.tenants[0].id).to.equal(assoc.tenantId);
    },
  );

  it(
    'get ' +
      prefix +
      '/adcs/{adcId}/adcs: Cannot find any Tenant associated with ADC',
    async () => {
      let adc = await givenAdcData(wafapp);

      let response = await client
        .get(prefix + '/adcs/' + adc.id + '/tenants')
        .expect(200);

      expect(response.body.tenants.length).to.equal(0);
    },
  );

  it(
    'get ' +
      prefix +
      '/adcs/{adcId}/tenants/{tenantId}: find Tenant associated with ADC',
    async () => {
      let adc = await givenAdcData(wafapp);
      let assoc = await givenAdcTenantAssociationData(wafapp, {
        adcId: adc.id,
        tenantId: '12345678',
      });

      let response = await client
        .get(prefix + '/adcs/' + adc.id + '/tenants/' + assoc.tenantId)
        .expect(200);

      expect(response.body.tenant.id).to.equal(assoc.tenantId);
    },
  );

  it(
    'get ' +
      prefix +
      '/adcs/{adcId}/tenants/{tenantId}: cannot find Tenant association ith ADC',
    async () => {
      let adc = await givenAdcData(wafapp);

      await client
        .get(prefix + '/adcs/' + adc.id + '/tenants/' + '12345678')
        .expect(404);
    },
  );

  it('post ' + prefix + '/adcs/{adcId}/action: ', async () => {
    let adc = await givenAdcData(wafapp);

    await setupEnvs()
      .then(async () => {
        let response = await client
          .post(prefix + '/adcs/' + adc.id + '/action')
          .set('X-Auth-Token', ExpectedData.userToken)
          .send({create: null})
          .expect(200);

        expect(response.body).containDeep({id: adc.id});
      })
      .finally(teardownEnvs);
  });
});
