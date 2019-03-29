// Copyright F5 Networks, Inc. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect, sinon, toJSON} from '@loopback/testlab';
import {HttpErrors} from '@loopback/rest';
import {AS3DeployRequest} from '../../src/models';
import {WafApplication} from '../..';
import {ApplicationController} from '../../src/controllers';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenApplicationData,
  givenAdcData,
  givenAdcTenantAssociationData,
  givenServiceData,
  givenPoolData,
  givenMemberData,
  givenRuleData,
  givenConditionData,
  givenActionData,
  givenEndpointpolicyData,
  createApplicationObject,
  givenWafpolicyData,
} from '../helpers/database.helpers';
import uuid = require('uuid');

describe('ApplicationController', () => {
  let wafapp: WafApplication;
  let controller: ApplicationController;
  let client: Client;
  let deployStub: sinon.SinonStub;

  const prefix = '/adcaas/v1';

  before('setupApplication', async () => {
    ({wafapp, client} = await setupApplication());

    controller = await wafapp.get<ApplicationController>(
      'controllers.ApplicationController',
    );
  });

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
    deployStub = sinon.stub(controller.as3Service, 'deploy');
  });

  after(async () => {
    await teardownApplication(wafapp);
  });

  afterEach(async () => {
    deployStub.restore();
  });

  it('post ' + prefix + '/applications: with no id', async () => {
    const application = createApplicationObject();

    const response = await client
      .post(prefix + '/applications')
      .send(application)
      .expect(200);

    expect(response.body).to.containDeep(toJSON(application));
  });

  it('get ' + prefix + '/applications: of all', async () => {
    const application = await givenApplicationData(wafapp);

    await client
      .get(prefix + '/applications')
      .expect(200, [toJSON(application)])
      .expect('Content-Type', /application\/json/);
  });

  it('get ' + prefix + '/applications: with filter string', async () => {
    const application = await givenApplicationData(wafapp);

    await client
      .get(prefix + '/applications')
      .query({filter: {where: {id: application.id}}})
      .expect(200, [toJSON(application)]);
  });

  it('get ' + prefix + '/applications/count', async () => {
    let response = await client.get(prefix + '/applications/count').expect(200);
    expect(response.body.count).to.eql(0);

    const application = await givenApplicationData(wafapp);

    response = await client
      .get(prefix + '/applications/count')
      .query({where: {id: application.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/applications/{id}: selected item', async () => {
    await givenApplicationData(wafapp);
    const application = await givenApplicationData(wafapp);

    await client
      .get(prefix + '/applications/' + application.id)
      .expect(200, toJSON(application));
  });

  it('get ' + prefix + '/applications/{id}: not found', async () => {
    await client.get(prefix + '/applications/' + uuid()).expect(404);
  });

  it('patch ' + prefix + '/applications/{id}: existing item', async () => {
    const patched_name = {name: 'new application name'};
    const application = await givenApplicationData(wafapp);

    await client
      .patch(prefix + '/applications/' + application.id)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/applications/{id}: non-existing item', async () => {
    const patched_name = {name: 'new application name'};
    await client
      .patch(prefix + '/applications/' + uuid())
      .send(patched_name)
      .expect(404);
  });

  it('delete ' + prefix + '/applications/{id}: non-existing item', async () => {
    await client.del(prefix + '/applications/' + uuid()).expect(404);
  });

  it('delete ' + prefix + '/applications/{id}: existing item', async () => {
    const application = await givenApplicationData(wafapp);

    await client.del(prefix + '/applications/' + application.id).expect(204);
  });

  it(
    'post ' +
      prefix +
      '/applications/{id}/deploy: no ADC associated with application',
    async () => {
      const application = await givenApplicationData(wafapp);

      await client
        .post(prefix + '/applications/' + application.id + '/deploy')
        .expect(422);
    },
  );

  it(
    'post ' + prefix + '/applications/{id}/deploy: application has no service',
    async () => {
      const application = await givenApplicationData(wafapp);
      const adc = await givenAdcData(wafapp);
      await givenAdcTenantAssociationData(wafapp, {
        tenantId: 'default',
        adcId: adc.id,
      });

      await client
        .post(prefix + '/applications/' + application.id + '/deploy')
        .expect(422);
    },
  );

  it(
    'post ' + prefix + '/applications/{id}/deploy: deploy without wap config',
    async () => {
      const adc = await givenAdcData(wafapp);
      await givenAdcTenantAssociationData(wafapp, {
        tenantId: 'default',
        adcId: adc.id,
      });
      let pool = await givenPoolData(wafapp, {
        name: 'pool1',
      });
      await givenMemberData(wafapp, {
        id: uuid(),
        poolId: pool.id,
      });
      let epp = await givenEndpointpolicyData(wafapp, {
        name: 'epp1',
      });
      await givenRuleData(wafapp, {
        id: '1234',
        name: 'rule1',
        endpointpolicyId: epp.id,
      });
      await givenRuleData(wafapp, {
        id: '2345',
        name: 'rule2',
        endpointpolicyId: epp.id,
      });
      await givenConditionData(wafapp, {
        ruleId: '1234',
        type: 'httpUri',
        path: {operand: 'contains', values: ['/test1/']},
      });

      await givenConditionData(wafapp, {
        ruleId: '1234',
        type: 'httpUri',
      });
      await givenConditionData(wafapp, {
        ruleId: '1234',
        type: 'test',
      });
      await givenActionData(wafapp, {
        ruleId: '2345',
        type: 'waf',
        policy: {wafpolicy: '12345678'},
      });

      let application = await givenApplicationData(wafapp);
      await givenServiceData(wafapp, <string>application.id, {
        pool: pool.id,
        endpointpolicy: epp.id,
      });

      deployStub.returns(Promise.resolve('Hello'));

      await client
        .post(prefix + '/applications/' + application.id + '/deploy')
        .expect(200);

      let req = <AS3DeployRequest>deployStub.getCall(0).args[2];
      req.declaration.toJSON();
    },
  );

  it('post ' + prefix + '/applications/{id}/deploy: no adcId', async () => {
    await givenAdcTenantAssociationData(wafapp, {
      tenantId: 'default',
    });
    let pool = await givenPoolData(wafapp, {
      name: 'pool1',
    });
    let application = await givenApplicationData(wafapp);
    await givenServiceData(wafapp, <string>application.id, {
      pool: pool.id,
    });

    deployStub.returns(Promise.resolve('Hello'));

    await client
      .post(prefix + '/applications/' + application.id + '/deploy')
      .expect(422);
  });

  it(
    'post ' + prefix + '/applications/{id}/deploy: no member in pool',
    async () => {
      const adc = await givenAdcData(wafapp);
      await givenAdcTenantAssociationData(wafapp, {
        tenantId: 'default',
        adcId: adc.id,
      });
      let pool = await givenPoolData(wafapp, {
        name: 'pool1',
      });
      let application = await givenApplicationData(wafapp);
      await givenServiceData(wafapp, <string>application.id, {
        pool: pool.id,
      });

      deployStub.returns(Promise.resolve('Hello'));

      await client
        .post(prefix + '/applications/' + application.id + '/deploy')
        .expect(200);
    },
  );
  it(
    'post ' + prefix + '/applications/{id}/deploy: unprocessable declaration',
    async () => {
      const adc = await givenAdcData(wafapp);
      await givenAdcTenantAssociationData(wafapp, {
        tenantId: 'default',
        adcId: adc.id,
      });
      let application = await givenApplicationData(wafapp);
      await givenServiceData(wafapp, <string>application.id);

      deployStub.throws(new HttpErrors.UnprocessableEntity('something wrong'));

      await client
        .post(prefix + '/applications/' + application.id + '/deploy')
        .expect(422);
    },
  );

  it(
    'post ' + prefix + '/applications/{id}/deploy: deploy with wap config',
    async () => {
      const adc = await givenAdcData(wafapp);
      await givenAdcTenantAssociationData(wafapp, {
        tenantId: 'default',
        adcId: adc.id,
      });
      let pool = await givenPoolData(wafapp, {
        name: 'pool1',
      });
      await givenMemberData(wafapp, {
        id: uuid(),
        poolId: pool.id,
      });

      let epp = await givenEndpointpolicyData(wafapp, {
        name: 'epp1',
      });

      let rule1 = await givenRuleData(wafapp, {
        name: 'rule1',
        endpointpolicyId: epp.id,
      });
      let rule2 = await givenRuleData(wafapp, {
        name: 'rule2',
        endpointpolicyId: epp.id,
      });

      let waf = await givenWafpolicyData(wafapp, {
        url: 'http://1.2.3.4/test.xml',
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
        type: 'httpUri',
      });
      await givenConditionData(wafapp, {
        ruleId: rule2.id,
        type: 'httpUri',
      });
      await givenActionData(wafapp, {
        ruleId: rule2.id,
        type: 'waf',
        policy: {wafpolicy: waf.id},
      });
      await givenActionData(wafapp, {
        ruleId: rule2.id,
        type: 'waf',
        policy: {wafpolicy: '12345678'},
      });
      await givenActionData(wafapp, {
        ruleId: rule2.id,
        type: 'waf',
        policy: {wafpolicy: waf.id},
      });
      await givenActionData(wafapp, {
        ruleId: rule1.id,
        type: 'waf',
        policy: {wafpolicy: waf.id},
      });
      await givenActionData(wafapp, {
        ruleId: rule1.id,
        type: 'test',
        policy: {wafpolicy: '12345678'},
      });

      let application = await givenApplicationData(wafapp, {});

      await givenServiceData(wafapp, application.id, {
        pool: pool.id,
        endpointpolicy: epp.id,
      });

      deployStub.returns(Promise.resolve('Hello'));

      await client
        .post(prefix + '/applications/' + application.id + '/deploy')
        .expect(200);

      let req = <AS3DeployRequest>deployStub.getCall(0).args[2];
      req.declaration.toJSON();
    },
  );
});
