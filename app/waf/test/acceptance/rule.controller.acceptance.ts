import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  createRuleObject,
  givenRuleData,
} from '../helpers/database.helpers';
import {Rule} from '../../src/models';
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
    const rule = new Rule(
      createRuleObject({
        id: uuid(),
      }),
    );

    const response = await client
      .post(prefix + '/rules')
      .send(rule)
      .expect(200);

    expect(response.body).to.containDeep(toJSON(rule));
  });

  it('post ' + prefix + '/rules: with no id', async () => {
    const rule = new Rule(createRuleObject());

    const response = await client
      .post(prefix + '/rules')
      .send(rule)
      .expect(200);

    expect(response.body).to.containDeep(toJSON(rule));
  });

  it('post ' + prefix + '/rules: with duplicate id', async () => {
    const rule = await givenRuleData(wafapp);

    await client
      .post(prefix + '/rules')
      .send(rule)
      .expect(409);
  });

  it('post ' + prefix + '/rules: no rule assocated', async () => {
    const rule = new Rule(
      createRuleObject({
        id: uuid(),
      }),
    );

    const response = await client
      .post(prefix + '/rules')
      .send(rule)
      .expect(200);

    expect(response.body).to.containDeep(toJSON(rule));
  });

  it('get ' + prefix + '/rules: of all', async () => {
    const rule = await givenRuleData(wafapp);

    await client
      .get(prefix + '/rules')
      .expect(200, [toJSON(rule)])
      .expect('Content-Type', /application\/json/);
  });

  it('get ' + prefix + '/rules: with filter string', async () => {
    const rule = await givenRuleData(wafapp);

    await client
      .get(prefix + '/rules')
      .query({filter: {where: {id: rule.id}}})
      .expect(200, [toJSON(rule)]);
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
    await givenRuleData(wafapp);
    const rule = await givenRuleData(wafapp);

    await client.get(prefix + '/rules/' + rule.id).expect(200, toJSON(rule));
  });

  it('get ' + prefix + '/rules/{id}: not found', async () => {
    await client.get(prefix + '/rules/' + uuid()).expect(404);
  });

  it('patch ' + prefix + '/rules/{id}: existing item', async () => {
    const patched_name = {name: 'new rule name'};
    const rule = await givenRuleData(wafapp);

    await client
      .patch(prefix + '/rules/' + rule.id)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/rules/{id}: non-existing item', async () => {
    const patched_name = {name: 'new rule name'};
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
});
