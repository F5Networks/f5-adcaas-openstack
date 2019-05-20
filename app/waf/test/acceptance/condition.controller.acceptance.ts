import {Client, expect} from '@loopback/testlab';
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
  givenConditionData,
  givenRuleData,
  createConditionObject,
} from '../helpers/database.helpers';

import {
  ShouldResponseWith,
  MockKeyStoneController,
  ExpectedData,
} from '../fixtures/controllers/mocks/mock.openstack.controller';
import uuid = require('uuid');

describe('ConditionController', () => {
  let wafapp: WafApplication;
  let client: Client;
  let mockKeystoneApp: TestingApplication;

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

  it('post ' + prefix + '/rules/{ruleId}/conditions', async () => {
    const rule = await givenRuleData(wafapp);
    const condition = createConditionObject({id: uuid()});

    const response = await client
      .post(prefix + `/rules/${rule.id}/conditions`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(condition)
      .expect(200);

    expect(response.body.condition.id)
      .to.not.empty()
      .and.type('string');
  });

  it('get ' + prefix + '/rules/{ruleId}/conditions/{conditionId}', async () => {
    const rule = await givenRuleData(wafapp);
    const condition = await givenConditionData(wafapp, {
      id: uuid(),
      ruleId: rule.id,
    });

    const response = await client
      .get(prefix + `/rules/${rule.id}/conditions/${condition.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(response.body.conditions[0].id)
      .to.not.empty()
      .and.type('string');
  });

  it('get ' + prefix + '/rules/{ruleId}/conditions', async () => {
    const rule = await givenRuleData(wafapp);
    await givenConditionData(wafapp, {id: uuid(), ruleId: rule.id});
    await givenConditionData(wafapp, {id: uuid(), ruleId: rule.id});

    const response = await client
      .get(prefix + `/rules/${rule.id}/conditions`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(response.body.conditions)
      .be.instanceOf(Array)
      .and.have.length(2);
  });

  it(
    'delete ' + prefix + '/rules/{ruleId}/conditions/{conditionId}',
    async () => {
      const rule = await givenRuleData(wafapp);
      const condition = await givenConditionData(wafapp, {
        id: uuid(),
        ruleId: rule.id,
      });
      await client
        .del(prefix + `/rules/${rule.id}/conditions/${condition.id}`)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(204);

      await client
        .get(prefix + `/rules/${rule.id}/conditions/${condition.id}`)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);
    },
  );

  it(
    'patch ' + prefix + '/rules/{ruleId}/conditions/{conditionId}',
    async () => {
      const rule = await givenRuleData(wafapp);
      const conditionInDb = await givenConditionData(wafapp, {
        id: uuid(),
        ruleId: rule.id,
      });

      const condition = createConditionObject({
        id: conditionInDb.id,
        type: 'request',
      });
      const response = await client
        .patch(prefix + `/rules/${rule.id}/conditions/${condition.id}`)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(condition)
        .expect(200);

      expect(response.body.count).to.eql(1);
    },
  );
});
