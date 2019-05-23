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
  createEndpointpolicyObject,
  givenEndpointpolicyData,
} from '../helpers/database.helpers';
import {Endpointpolicy} from '../../src/models';
import {
  ShouldResponseWith,
  MockKeyStoneController,
  ExpectedData,
} from '../fixtures/controllers/mocks/mock.openstack.controller';

import uuid = require('uuid');

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

  it('post ' + prefix + '/endpointpolicies: with id', async () => {
    const epp = createEndpointpolicyObject({id: uuid()});

    const response = await client
      .post(prefix + '/endpointpolicies')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(epp)
      .expect(200);

    expect(response.body.endpointpolicy.id)
      .to.not.empty()
      .and.type('string');
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
      const epp = await givenEndpointpolicyData(wafapp);
      epp.name = 'test';

      await client
        .patch(prefix + `/endpointpolicies/${epp.id}`)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(epp)
        .expect(204);
      await client
        .get(prefix + `/endpointpolicies/${epp.id}`)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);
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
