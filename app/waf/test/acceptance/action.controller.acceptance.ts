import {Client, expect} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenActionData,
  givenRuleData,
  createActionObject,
} from '../helpers/database.helpers';
import uuid = require('uuid');

describe('ActionController', () => {
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

  it('post ' + prefix + '/rules/{rule_id}/actions', async () => {
    const rule = await givenRuleData(wafapp);
    const action = createActionObject();

    const response = await client
      .post(prefix + `/rules/${rule.id}/actions`)
      .send(action)
      .expect(200);

    expect(response.body.id)
      .to.not.empty()
      .and.type('string');
  });

  it('get ' + prefix + '/rules/{rule_id}/actions/{action_id}', async () => {
    const rule = await givenRuleData(wafapp);
    const action = await givenActionData(wafapp, {id: uuid(), ruleId: rule.id});

    const response = await client
      .get(prefix + `/rules/${rule.id}/actions/${action.id}`)
      .expect(200);

    expect(response.body.id)
      .to.not.empty()
      .and.type('string');
  });

  it('get ' + prefix + '/rules/{rule_id}/actions', async () => {
    const rule = await givenRuleData(wafapp);
    await givenActionData(wafapp, {id: uuid(), ruleId: rule.id});
    await givenActionData(wafapp, {id: uuid(), ruleId: rule.id});

    const response = await client
      .get(prefix + `/rules/${rule.id}/actions`)
      .expect(200);

    expect(response.body)
      .be.instanceOf(Array)
      .and.have.length(2);
  });

  it('delete ' + prefix + '/rules/{rule_id}/actions/{action_id}', async () => {
    const rule = await givenRuleData(wafapp);
    const action = await givenActionData(wafapp, {id: uuid(), ruleId: rule.id});
    await client
      .del(prefix + `/rules/${rule.id}/actions/${action.id}`)
      .expect(204);

    await client
      .get(prefix + `/rules/${rule.id}/actions/${action.id}`)
      .expect(404);
  });

  it('put ' + prefix + '/rules/{rule_id}/actions/{action_id}', async () => {
    const rule = await givenRuleData(wafapp);
    const actionInDb = await givenActionData(wafapp, {
      id: uuid(),
      ruleId: rule.id,
    });

    const action = createActionObject({
      id: actionInDb.id,
      type: 'test',
    });
    const response = await client
      .patch(prefix + `/rules/${rule.id}/actions/${action.id}`)
      .send(action)
      .expect(200);

    expect(response.body.count).to.eql(1);
  });
});
