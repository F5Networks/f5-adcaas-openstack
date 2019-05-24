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
  setupEnvs,
  teardownEnvs,
} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenWafpolicyData,
  createWafpolicyObject,
} from '../helpers/database.helpers';
import {
  ShouldResponseWith,
  MockKeyStoneController,
  ExpectedData,
} from '../fixtures/controllers/mocks/mock.openstack.controller';

import uuid = require('uuid');

describe('WafpolicyController', () => {
  let wafapp: WafApplication;
  let client: Client;
  let mockKeystoneApp: TestingApplication;

  const prefix = '/adcaas/v1';

  before('setupApplication', async () => {
    mockKeystoneApp = await (async () => {
      let {restApp} = await setupRestAppAndClient(
        RestApplicationPort.IdentityAdmin,
        MockKeyStoneController,
      );
      return restApp;
    })();
    ({wafapp, client} = await setupApplication());
    ShouldResponseWith({});
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

  it('post ' + prefix + '/wafpolicies: with no id', async () => {
    const wafpolicy = createWafpolicyObject({tenantId: ExpectedData.tenantId});

    const response = await client
      .post(prefix + '/wafpolicies')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(wafpolicy)
      .expect(200);

    expect(response.body.wafpolicy).to.containDeep(toJSON(wafpolicy));
  });

  it('get ' + prefix + '/wafpolicies: of all', async () => {
    const wafpolicy = await givenWafpolicyData(wafapp);

    let response = await client
      .get(prefix + '/wafpolicies')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(toJSON(wafpolicy)).to.containDeep(response.body.wafpolicies[0]);
  });

  it('get ' + prefix + '/wafpolicies: with filter string', async () => {
    const wafpolicy = await givenWafpolicyData(wafapp);

    let response = await client
      .get(prefix + '/wafpolicies')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({filter: {where: {id: wafpolicy.id}}})
      .expect(200);

    expect(toJSON(wafpolicy)).to.containDeep(response.body.wafpolicies[0]);
  });

  it('get ' + prefix + '/wafpolicies/count', async () => {
    let response = await client
      .get(prefix + '/wafpolicies/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(response.body.count).to.eql(0);

    const wafpolicy = await givenWafpolicyData(wafapp);

    response = await client
      .get(prefix + '/wafpolicies/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({where: {id: wafpolicy.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/wafpolicies/{id}: selected item', async () => {
    await givenWafpolicyData(wafapp);
    const wafpolicy = await givenWafpolicyData(wafapp);

    let response = await client
      .get(prefix + '/wafpolicies/' + wafpolicy.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(toJSON(wafpolicy)).to.containDeep(response.body.wafpolicy);
  });

  it('get ' + prefix + '/wafpolicies/{id}: not found', async () => {
    await client
      .get(prefix + '/wafpolicies/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });

  it('patch ' + prefix + '/wafpolicies/{id}: existing item', async () => {
    const patched_name = {name: 'new waf policy name'};
    const wafpolicy = await givenWafpolicyData(wafapp);

    await client
      .patch(prefix + '/wafpolicies/' + wafpolicy.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/wafpolicies/{id}: non-existing item', async () => {
    const patched_name = {name: 'new waf policy name'};
    await client
      .patch(prefix + '/wafpolicies/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(patched_name)
      .expect(404);
  });

  it('delete ' + prefix + '/wafpolicies/{id}: non-existing item', async () => {
    await client
      .del(prefix + '/wafpolicies/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });

  it('delete ' + prefix + '/wafpolicies/{id}: existing item', async () => {
    const wafpolicy = await givenWafpolicyData(wafapp);

    await client
      .del(prefix + '/wafpolicies/' + wafpolicy.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(204);
  });
});
