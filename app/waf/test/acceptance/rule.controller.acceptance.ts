import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  createRuleObject,
  givenRuleData,
  givenEndpointpolicyData,
} from '../helpers/database.helpers';
import uuid = require('uuid');

describe('RuleController', () => {
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

  it('post ' + prefix + '/rules: with id', async () => {
    const rule = createRuleObject({
      id: uuid(),
      endpointpolicyId: uuid(),
    });

    const response = await client
      .post(prefix + '/rules')
      .send(rule)
      .expect(200);
    expect(response.body.rule.id)
      .to.not.empty()
      .and.type('string');
  });

  it('post ' + prefix + '/rules: with no id', async () => {
    const rule = createRuleObject({endpointpolicyId: uuid()});

    const response = await client
      .post(prefix + '/rules')
      .send(rule)
      .expect(200);
    expect(response.body.rule.id)
      .to.not.empty()
      .and.type('string');
    expect(response.body.rule).to.containDeep(toJSON(rule));
  });

  it('post ' + prefix + '/rules: with duplicate id', async () => {
    const rule = await givenRuleData(wafapp);

    await client
      .post(prefix + '/rules')
      .send(rule)
      .expect(200);
  });

  it('post ' + prefix + '/rules: no rule assocated', async () => {
    const rule = createRuleObject();

    const response = await client
      .post(prefix + '/rules')
      .send(rule)
      .expect(200);

    expect(response.body.rule.id)
      .to.not.empty()
      .and.type('string');
    expect(response.body.rule).to.containDeep(toJSON(rule));
  });

  it('get ' + prefix + '/rules: of all', async () => {
    await givenRuleData(wafapp);
    await client.get(prefix + '/rules').expect(200);
  });

  it('get ' + prefix + '/rules: with filter string', async () => {
    const rule = await givenRuleData(wafapp);

    await client
      .get(prefix + '/rules')
      .query({filter: {where: {id: rule.id}}})
      .expect(200);
  });

  it('get ' + prefix + '/rules/count', async () => {
    let response = await client.get(prefix + '/rules/count').expect(200);
    expect(response.body.count).to.eql(0);

    const rule = await givenRuleData(wafapp);

    response = await client
      .get(prefix + '/rules/count')
      .query({where: {id: rule.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/rules/{id}: selected item', async () => {
    const rule = await givenRuleData(wafapp);
    const response = await client.get(prefix + '/rules/' + rule.id).expect(200);
    expect(response.body.rule.id).equal(rule.id);
  });

  it('get ' + prefix + '/rules/{id}: not found', async () => {
    await client.get(prefix + '/rules/' + uuid()).expect(404);
  });

  it('patch ' + prefix + '/rules/{id}: existing item', async () => {
    const patched_name = {name: 'new rule name', endpointpolicyId: uuid()};
    const rule = await givenRuleData(wafapp);

    await client
      .patch(prefix + '/rules/' + rule.id)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/rules/{id}: non-existing item', async () => {
    const patched_name = {name: 'new rule name', endpointpolicyId: uuid()};
    await client
      .patch(prefix + '/rules/' + uuid())
      .send(patched_name)
      .expect(404);
  });

  it('delete ' + prefix + '/rules/{id}: non-existing item', async () => {
    await client.del(prefix + '/rules/' + uuid()).expect(404);
  });

  it('delete ' + prefix + '/rules/{id}: existing item', async () => {
    const rule = await givenRuleData(wafapp);

    await client.del(prefix + '/rules/' + rule.id).expect(204);
  });

  it(
    'delete ' + prefix + '/endpointpolicies/{endpointpolicyId}/rules/{ruleId}',
    async () => {
      const epp = await givenEndpointpolicyData(wafapp);
      const rule = await givenRuleData(wafapp, {
        id: uuid(),
        endpointpolicyId: epp.id,
      });

      await client
        .del(prefix + `/endpointpolicies/${epp.id}/rules/${rule.id}`)
        .expect(204);

      await client
        .get(prefix + `/endpointpolicies/${epp.id}/rules/${rule.id}`)
        .expect(200);
    },
  );

  it(
    'post ' + prefix + '/endpointpolicies/{endpointpolicyId}/rules',
    async () => {
      const epp = await givenEndpointpolicyData(wafapp);
      const rule = createRuleObject({id: uuid()});

      const response = await client
        .post(prefix + `/endpointpolicies/${epp.id}/rules`)
        .send(rule)
        .expect(200);

      expect(response.body.rule.id)
        .to.not.empty()
        .and.type('string');
    },
  );

  it(
    'get ' + prefix + '/endpointpolicies/{endpointpolicyId}/rules',
    async () => {
      const epp = await givenEndpointpolicyData(wafapp);
      await givenRuleData(wafapp, {id: uuid(), endpointpolicyId: epp.id});
      await givenRuleData(wafapp, {id: uuid(), endpointpolicyId: epp.id});

      const response = await client
        .get(prefix + `/endpointpolicies/${epp.id}/rules`)
        .expect(200);

      expect(response.body.rules)
        .be.instanceOf(Array)
        .and.have.length(2);
    },
  );

  it(
    'get ' + prefix + '/endpointpolicies/{endpointpolicyId}/rules/{ruleId}',
    async () => {
      const epp = await givenEndpointpolicyData(wafapp);
      const rule = await givenRuleData(wafapp, {
        id: uuid(),
        endpointpolicyId: epp.id,
      });

      const response = await client
        .get(prefix + `/endpointpolicies/${epp.id}/rules/${rule.id}`)
        .expect(200);

      expect(response.body.rules[0].id)
        .to.not.empty()
        .and.type('string');
    },
  );

  it(
    'patch ' + prefix + '/endpointpolicies/{endpointpolicyId}/rules/{ruleId}',
    async () => {
      const epp = await givenEndpointpolicyData(wafapp);
      const rule = await givenRuleData(wafapp, {
        id: uuid(),
        endpointpolicyId: epp.id,
      });
      const patched_name = {id: rule.id, name: 'test'};

      const response = await client
        .patch(prefix + `/endpointpolicies/${epp.id}/rules/${rule.id}`)
        .send(patched_name)
        .expect(200);

      expect(response.body.count).to.eql(1);
    },
  );
});
