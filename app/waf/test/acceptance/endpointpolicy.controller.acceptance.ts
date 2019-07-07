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

import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {
  setupApplication,
  teardownApplication,
  TestingApplication,
  setupRestAppAndClient,
  teardownRestAppAndClient,
  setupEnvs,
  teardownEnvs,
} from '../helpers/testsetup-helper';
import {
  givenEmptyDatabase,
  createEndpointpolicyObject,
  givenEndpointpolicyData,
} from '../helpers/database.helpers';
import {Endpointpolicy} from '../../src/models';
import {MockKeyStoneController} from '../fixtures/controllers/mocks/mock.openstack.controller';
import uuid = require('uuid');
import {
  RestApplicationPort,
  ExpectedData,
  LetResponseWith,
} from '../fixtures/datasources/testrest.datasource';

describe('EndpointpolicyController', () => {
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
    LetResponseWith({});
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

  it('post ' + prefix + '/endpointpolicies: with no id', async () => {
    const epp = createEndpointpolicyObject();

    const response = await client
      .post(prefix + '/endpointpolicies')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(epp)
      .expect(200);

    expect(response.body.endpointpolicy).to.containDeep(toJSON(epp));
  });

  it(
    'post ' + prefix + '/endpointpolicies: no endpointpolicy assocated',
    async () => {
      const request = createEndpointpolicyObject();

      const response = await client
        .post(prefix + '/endpointpolicies')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(request)
        .expect(200);

      expect(response.body.endpointpolicy.id)
        .to.not.empty()
        .and.type('string');
      expect(response.body.endpointpolicy).to.containDeep(toJSON(request));
    },
  );

  it('get ' + prefix + '/endpointpolicies: of all', async () => {
    const epp = await givenEndpointpolicyData(wafapp);
    const response = await client
      .get(prefix + '/endpointpolicies')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(toJSON(epp)).to.containDeep(response.body.endpointpolicies[0]);
  });

  it('get ' + prefix + '/endpointpolicies: with filter string', async () => {
    const epp = await givenEndpointpolicyData(wafapp);

    const response = await client
      .get(prefix + '/endpointpolicies')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({where: {id: epp.getId()}})
      .expect(200);
    expect(toJSON(epp)).to.containDeep(response.body.endpointpolicies[0]);
  });

  it('get ' + prefix + '/endpointpolicies/count', async () => {
    let response = await client
      .get(prefix + '/endpointpolicies/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(response.body.count).to.eql(0);

    const epp = await givenEndpointpolicyData(wafapp);

    response = await client
      .get(prefix + '/endpointpolicies/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({where: {id: epp.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it(
    'get ' + prefix + '/endpointpolicies/{endpointpolicyId}: selected item',
    async () => {
      await givenEndpointpolicyData(wafapp);
      const epp = await givenEndpointpolicyData(wafapp);

      await client
        .get(prefix + '/endpointpolicies/' + epp.id)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);
    },
  );

  it(
    'get ' + prefix + '/endpointpolicies/{endpointpolicyId}: not found',
    async () => {
      await client
        .get(prefix + '/endpointpolicies/' + uuid())
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(404);
    },
  );

  it(
    'patch ' + prefix + '/endpointpolicies/{endpointpolicyId}: existing item',
    async () => {
      const eppInDb = await givenEndpointpolicyData(wafapp);
      const epp = createEndpointpolicyObject({name: 'new epp'});

      await client
        .patch(prefix + `/endpointpolicies/${eppInDb.id}`)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(epp)
        .expect(204);

      let response = await client
        .get(prefix + `/endpointpolicies/${eppInDb.id}`)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      expect(response.body.endpointpolicy.name).to.equal(epp.name);
    },
  );

  it(
    'patch ' +
      prefix +
      '/endpointpolicies/{endpointpolicyId}: non-existing item',
    async () => {
      const patched_name = {name: 'new endpointpolicy name'};
      await client
        .patch(prefix + '/endpointpolicies/' + uuid())
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(patched_name)
        .expect(404);
    },
  );

  it(
    'delete ' +
      prefix +
      '/endpointpolicies/{endpointpolicyId}: non-existing item',
    async () => {
      await client
        .del(prefix + '/endpointpolicies/' + uuid())
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(404);
    },
  );

  it(
    'delete ' + prefix + '/endpointpolicies/{endpointpolicyId}: existing item',
    async () => {
      const epp = await givenEndpointpolicyData(wafapp);

      await client
        .del(prefix + '/endpointpolicies/' + epp.id)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(204);
    },
  );

  it(
    'put ' + prefix + '/endpointpolicies/{endpointpolicyId}: non-existing item',
    async () => {
      const epp = new Endpointpolicy(
        createEndpointpolicyObject({
          name: 'new endpointpolicy name.',
        }),
      );
      await client
        .put(prefix + '/endpointpolicies/' + epp.id)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(epp)
        .expect(404);
    },
  );
});
