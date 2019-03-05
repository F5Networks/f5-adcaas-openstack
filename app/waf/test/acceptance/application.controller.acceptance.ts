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
  givenTenantAssociationData,
  givenServiceData,
  givenPoolData,
  givenMemberData,
  givenRuleData,
  givenWafpolicyData,
  givenEndpointpolicyData,
  createApplicationObject,
} from '../helpers/database.helpers';
import {Application} from '../../src/models';
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

  it('post ' + prefix + '/applications: with id', async () => {
    const application = new Application(
      createApplicationObject({
        id: uuid(),
      }),
    );

    const response = await client
      .post(prefix + '/applications')
      .send(application)
      .expect(200);

    expect(response.body).to.containDeep(toJSON(application));
  });

  it('post ' + prefix + '/applications: with no id', async () => {
    const application = new Application(createApplicationObject());

    const response = await client
      .post(prefix + '/applications')
      .send(application)
      .expect(200);

    expect(response.body).to.containDeep(toJSON(application));
  });

  it('post ' + prefix + '/applications: with duplicate id', async () => {
    const application = await givenApplicationData(wafapp);

    await client
      .post(prefix + '/applications')
      .send(application)
      .expect(400);
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

  it('patch ' + prefix + '/applications: all items', async () => {
    await givenApplicationData(wafapp);
    await givenApplicationData(wafapp);

    const patched_name = {name: 'updated application name'};
    let response = await client
      .patch(prefix + '/applications')
      .send(patched_name)
      .expect(200);

    expect(response.body.count).to.eql(2);

    response = await client
      .get(prefix + '/applications/count')
      .query({where: patched_name})
      .expect(200);
    expect(response.body.count).to.eql(2);
  });

  it('patch ' + prefix + '/applications: selected items', async () => {
    await givenApplicationData(wafapp);
    await givenApplicationData(wafapp);

    const patch_condition = {description: 'the only one to patch'};
    const patched_name = {name: 'updated application name'};
    await givenApplicationData(wafapp, patch_condition);

    let response = await client
      .patch(prefix + '/applications')
      .query({where: patch_condition})
      .send(patched_name)
      .expect(200);

    expect(response.body.count).to.eql(1);

    response = await client
      .get(prefix + '/applications/count')
      .query({where: patched_name})
      .expect(200);
    expect(response.body.count).to.eql(1);

    response = await client
      .get(prefix + '/applications/count')
      .query({where: patch_condition})
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

  it('put' + prefix + '/applications/{id}: existing item', async () => {
    const application = await givenApplicationData(wafapp);

    const wafpolicy_new = new Application(
      createApplicationObject({
        name: 'new application name.',
      }),
    );
    await client
      .put(prefix + '/applications/' + application.id)
      .send(wafpolicy_new)
      .expect(204);

    const response = await client
      .get(prefix + '/applications/' + application.id)
      .expect(200);

    expect(response.body).to.containDeep({name: 'new application name.'});
  });

  it('put ' + prefix + '/applications/{id}: non-existing item', async () => {
    const application = new Application(
      createApplicationObject({
        name: 'new application name.',
      }),
    );
    await client
      .put(prefix + '/applications/' + application.id)
      .send(application)
      .expect(404);
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
      await givenTenantAssociationData(wafapp, {
        tenantId: 'default',
        adcId: adc.id,
      });

      await client
        .post(prefix + '/applications/' + application.id + '/deploy')
        .expect(422);
    },
  );

  it(
    'post ' + prefix + '/applications/{id}/deploy: deploy as3 config',
    async () => {
      const adc = await givenAdcData(wafapp);
      await givenTenantAssociationData(wafapp, {
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
      let waf1 = await givenWafpolicyData(wafapp, {
        name: 'rule1',
        url: 'http://1.2.3.4/a.xml',
      });
      let waf2 = await givenWafpolicyData(wafapp, {
        name: 'rule2',
        url: 'http://1.2.3.4/a.xml',
      });
      let rule1 = await givenRuleData(wafapp, {
        name: 'rule1',
        default: true,
        pattern: 'test1',
        wafpolicy: waf1.id,
      });
      let rule2 = await givenRuleData(wafapp, {
        name: 'rule2',
        default: false,
        pattern: 'test2',
        wafpolicy: waf2.id,
      });
      let epp = await givenEndpointpolicyData(wafapp, {
        name: 'epp1',
        rules: [rule1.id, rule2.id],
      });
      let service = await givenServiceData(wafapp, {
        pool: pool.id,
        endpointpolicy: epp.id,
      });
      let application = await givenApplicationData(wafapp, {
        services: [service.id],
      });

      deployStub.returns(Promise.resolve('Hello'));

      await client
        .post(prefix + '/applications/' + application.id + '/deploy')
        .expect(200);

      let req = <AS3DeployRequest>deployStub.getCall(0).args[2];
      req.declaration.toJSON();
    },
  );

  it(
    'post ' + prefix + '/applications/{id}/deploy: more than one default rules',
    async () => {
      const adc = await givenAdcData(wafapp);
      await givenTenantAssociationData(wafapp, {
        tenantId: 'default',
        adcId: adc.id,
      });
      let pool = await givenPoolData(wafapp, {
        name: 'pool1',
      });
      await givenMemberData(wafapp, {id: uuid(), poolId: pool.id});
      let waf1 = await givenWafpolicyData(wafapp, {
        name: 'rule1',
        url: 'http://1.2.3.4/a.xml',
      });
      let waf2 = await givenWafpolicyData(wafapp, {
        name: 'rule2',
        url: 'http://1.2.3.4/a.xml',
      });
      let rule1 = await givenRuleData(wafapp, {
        name: 'rule1',
        default: true,
        pattern: 'test1',
        wafpolicy: waf1.id,
      });
      let rule2 = await givenRuleData(wafapp, {
        name: 'rule2',
        default: true,
        pattern: 'test2',
        wafpolicy: waf2.id,
      });
      let epp = await givenEndpointpolicyData(wafapp, {
        name: 'epp1',
        rules: [rule1.id, rule2.id],
      });
      let service = await givenServiceData(wafapp, {
        pool: pool.id,
        endpointpolicy: epp.id,
      });
      let application = await givenApplicationData(wafapp, {
        services: [service.id],
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
    await givenTenantAssociationData(wafapp, {
      tenantId: 'default',
    });
    let pool = await givenPoolData(wafapp, {
      name: 'pool1',
    });
    let service = await givenServiceData(wafapp, {
      pool: pool.id,
    });
    let application = await givenApplicationData(wafapp, {
      services: [service.id],
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
      await givenTenantAssociationData(wafapp, {
        tenantId: 'default',
        adcId: adc.id,
      });
      let pool = await givenPoolData(wafapp, {
        name: 'pool1',
      });
      let service = await givenServiceData(wafapp, {
        pool: pool.id,
      });
      let application = await givenApplicationData(wafapp, {
        services: [service.id],
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
      await givenTenantAssociationData(wafapp, {
        tenantId: 'default',
        adcId: adc.id,
      });
      let service = await givenServiceData(wafapp);
      let application = await givenApplicationData(wafapp, {
        services: [service.id],
      });

      deployStub.throws(new HttpErrors.UnprocessableEntity('something wrong'));

      await client
        .post(prefix + '/applications/' + application.id + '/deploy')
        .expect(422);
    },
  );
});
