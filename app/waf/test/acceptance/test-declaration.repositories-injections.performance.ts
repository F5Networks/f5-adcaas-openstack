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

import {Client} from '@loopback/testlab';
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
  givenApplicationData,
  givenServiceData,
  givenPoolData,
  givenMemberData,
  givenMonitorData,
  givenRuleData,
  givenConditionData,
  givenActionData,
  givenWafpolicyData,
  givenEndpointpolicyData,
  givePoolMonitorAssociationData,
  giveMemberMonitorAssociationData,
  givenServiceEndpointpolicyAssociationData,
} from '../helpers/database.helpers';
import {
  OSShouldResponseWith,
  MockKeyStoneController,
  ExpectedData,
} from '../fixtures/controllers/mocks/mock.openstack.controller';
import {Application} from '../../src/models';

async function provideApplicationData(
  wafapp: WafApplication,
): Promise<Application> {
  await givenEmptyDatabase(wafapp);

  const application = await givenApplicationData(wafapp);

  let pool = await givenPoolData(wafapp, {
    name: 'pool1',
  });

  let service = await givenServiceData(wafapp, application.id, {
    defaultPoolId: pool.id,
  });

  let member = await givenMemberData(wafapp, {
    poolId: pool.id,
  });

  let monitor = await givenMonitorData(wafapp);

  await givePoolMonitorAssociationData(wafapp, {
    poolId: pool.id,
    monitorId: monitor.id,
  });

  giveMemberMonitorAssociationData(wafapp, {
    memberId: member.id,
    monitorId: monitor.id,
  });

  let epp = await givenEndpointpolicyData(wafapp);

  await givenServiceEndpointpolicyAssociationData(wafapp, {
    serviceId: service.id,
    endpointpolicyId: epp.id,
  });

  let rule1 = await givenRuleData(wafapp, {
    name: 'rule1',
    endpointpolicyId: epp.id,
  });

  let rule2 = await givenRuleData(wafapp, {
    name: 'rule2',
    endpointpolicyId: epp.id,
  });

  await givenConditionData(wafapp, {
    ruleId: rule1.id,
    type: 'httpUri',
    path: {operand: 'contains', values: ['/test1/']},
  });

  await givenConditionData(wafapp, {
    ruleId: rule1.id,
    type: 'httpUri',
  });

  await givenConditionData(wafapp, {
    ruleId: rule1.id,
    type: 'test',
  });

  let wafpolicy = await givenWafpolicyData(wafapp);

  await givenActionData(wafapp, {
    ruleId: rule2.id,
    type: 'waf',
    policy: wafpolicy.id,
  });

  return application;
}

async function testFunc1(
  client: Client,
  prefix: string,
  application: Application,
) {
  let start = Date.now();
  let response = await client
    .post(prefix + '/applications/' + application.id + '/declarations')
    .set('X-Auth-Token', ExpectedData.userToken)
    .set('tenant-id', ExpectedData.tenantId)
    .send({name: 'a-declaration'})
    .expect(200);

  let postEnd = Date.now();
  let declarationId = response.body.declaration.id;

  response = await client
    .get(
      prefix +
        '/applications/' +
        application.id +
        '/declarations/' +
        declarationId,
    )
    .set('X-Auth-Token', ExpectedData.userToken)
    .set('tenant-id', ExpectedData.tenantId)
    .expect(200);

  let getEnd = Date.now();

  await client
    .del(
      prefix +
        '/applications/' +
        application.id +
        '/declarations/' +
        declarationId,
    )
    .set('X-Auth-Token', ExpectedData.userToken)
    .set('tenant-id', ExpectedData.tenantId)
    .expect(204);

  let delEnd = Date.now();

  console.log(
    `durations: post(${postEnd - start}), get(${getEnd -
      postEnd}), delete(${delEnd - getEnd})`,
  );
}

async function testFunc(
  client: Client,
  wafapp: WafApplication,
  times: number,
  prefix: string,
) {
  let application = await provideApplicationData(wafapp);

  while (--times > 0) {
    await testFunc1(client, prefix, application);
  }
}

let tries = 30;

describe('v1', async () => {
  let wafapp: WafApplication;
  let client: Client;
  let mockKeystoneApp: TestingApplication;

  before('setupApplication', async () => {
    mockKeystoneApp = await (async () => {
      let {restApp} = await setupRestAppAndClient(
        RestApplicationPort.IdentityAdmin,
        MockKeyStoneController,
      );
      return restApp;
    })();

    ({wafapp, client} = await setupApplication());

    await setupEnvs();
    OSShouldResponseWith({});
  });

  after(async () => {
    await teardownApplication(wafapp);
    await teardownRestAppAndClient(mockKeystoneApp);
    await teardownEnvs();
  });

  beforeEach('Empty database', async () => {});

  afterEach(async () => {});

  it('test performance v1', async () => {
    await testFunc(client, wafapp, tries, '/adcaas/v1');
  });
});

describe('v2', async () => {
  let wafapp: WafApplication;
  let client: Client;
  let mockKeystoneApp: TestingApplication;

  before('setupApplication', async () => {
    mockKeystoneApp = await (async () => {
      let {restApp} = await setupRestAppAndClient(
        RestApplicationPort.IdentityAdmin,
        MockKeyStoneController,
      );
      return restApp;
    })();

    ({wafapp, client} = await setupApplication());

    await setupEnvs();
    OSShouldResponseWith({});
  });

  after(async () => {
    await teardownApplication(wafapp);
    await teardownRestAppAndClient(mockKeystoneApp);
    await teardownEnvs();
  });

  beforeEach('Empty database', async () => {});

  afterEach(async () => {});

  it('test performance v2', async () => {
    await testFunc(client, wafapp, tries, '/adcaas/v2');
  });
});
