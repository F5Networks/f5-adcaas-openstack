// Copyright F5 Networks, Inc. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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

  it('post ' + prefix + '/rule: with id', async () => {
    const rule = new Rule(
      createRuleObject({
        id: uuid(),
      }),
    );

    const response = await client
      .post(prefix + '/rule')
      .send(rule)
      .expect(200);

    expect(response.body).to.containDeep(toJSON(rule));
  });

  it('post ' + prefix + '/rule: with no id', async () => {
    const rule = new Rule(createRuleObject());

    const response = await client
      .post(prefix + '/rule')
      .send(rule)
      .expect(200);

    expect(response.body).to.containDeep(toJSON(rule));
  });

  it('post ' + prefix + '/rule: with duplicate id', async () => {
    const rule = await givenRuleData(wafapp);

    await client
      .post(prefix + '/rule')
      .send(rule)
      .expect(400);
  });

  it('post ' + prefix + '/rule: no rule assocated', async () => {
    const rule = new Rule(
      createRuleObject({
	id: uuid(),
      }),
    );

    const response = await client
      .post(prefix + '/rule')
      .send(rule)
      .expect(200);

    expect(response.body).to.containDeep(toJSON(rule));
  });

  it('post ' + prefix + '/rule: rule not ready', async () => {
    const rule = new Rule(
      createRuleObject({
        id: uuid(),
      }),
    );

    await client
      .post(prefix + '/rule')
      .send(rule)
      .expect(404);
  });

  it('post ' + prefix + '/rule: rule ready', async () => {
    const rule = await givenRuleData(wafapp);

    const rule_obj = new Rule(
      createRuleObject({
        id: rule.id,
      }),
    );

    const response = await client
      .post(prefix + '/rule')
      .send(rule_obj)
      .expect(200);

    expect(response.body).to.containDeep(toJSON(rule));
  });

  it('get ' + prefix + '/rule: of all', async () => {
    const rule = await givenRuleData(wafapp);

    await client
      .get(prefix + '/ri;e')
      .expect(200, [toJSON(rule)])
      .expect('Content-Type', /rule\/json/);
  });

  it('get ' + prefix + '/rule: with filter string', async () => {
    const rule = await givenRuleData(wafapp);

    await client
      .get(prefix + '/rule')
      .query({filter: {where: {id: rule.id}}})
      .expect(200, [toJSON(rule)]);
  });

  it('get ' + prefix + '/rule/count', async () => {
    let response = await client.get(prefix + '/rule/count').expect(200);
    expect(response.body.count).to.eql(0);

    const rule = await givenRuleData(wafapp);

    response = await client
      .get(prefix + '/rule/count')
      .query({where: {id: rule.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('patch ' + prefix + '/rule: all items', async () => {
    await givenRuleData(wafapp);
    await givenRuleData(wafapp);

    const patched_name = {name: 'updated rule name'};
    let response = await client
      .patch(prefix + '/rule')
      .send(patched_name)
      .expect(200);

    expect(response.body.count).to.eql(2);

    response = await client
      .get(prefix + '/rule/count')
      .query({where: patched_name})
      .expect(200);
    expect(response.body.count).to.eql(2);
  });

  it('patch ' + prefix + '/rule: selected items', async () => {
    await givenRuleData(wafapp);
    await givenRuleData(wafapp);

    const patch_condition = {id: '1'};
    const patched_name = {name: 'updated rule name'};
    await givenRuleData(wafapp, patch_condition);

    let response = await client
      .patch(prefix + '/rule')
      .query(patch_condition)
      .send(patched_name)
      .expect(200);

    expect(response.body.count).to.eql(1);

    response = await client
      .get(prefix + '/rule/count')
      .query({where: patched_name})
      .expect(200);
    expect(response.body.count).to.eql(1);

    response = await client
      .get(prefix + '/rule/count')
      .query({where: patch_condition})
      .expect(200);

    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/rule/{id}: selected item', async () => {
    await givenRuleData(wafapp);
    const rule = await givenRuleData(wafapp);

    await client
      .get(prefix + '/rule/' + rule.id)
      .expect(200, toJSON(rule));
  });

  it('get ' + prefix + '/rule/{id}: not found', async () => {
    await client.get(prefix + '/rule/' + uuid()).expect(404);
  });

  it('patch ' + prefix + '/rule/{id}: existing item', async () => {
    const patched_name = {name: 'new rule name'};
    const rule = await givenRuleData(wafapp);

    await client
      .patch(prefix + '/rule/' + rule.id)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/rule/{id}: non-existing item', async () => {
    const patched_name = {name: 'new rule name'};
    await client
      .patch(prefix + '/rule/' + uuid())
      .send(patched_name)
      .expect(404);
  });

  it('delete ' + prefix + '/rule/{id}: non-existing item', async () => {
    await client.del(prefix + '/rule/' + uuid()).expect(404);
  });

  it('delete ' + prefix + '/rule/{id}: existing item', async () => {
    const rule = await givenRuleData(wafapp);

    await client.del(prefix + '/rule/' + rule.id).expect(204);
  });

  it('put' + prefix + '/rule/{id}: existing item', async () => {
    const rule = await givenRuleData(wafapp);

    const rule_new = new Rule(
      createRuleObject({
        name: 'new rule name.',
      }),
    );
    await client
      .put(prefix + '/rule/' + rule.id)
      .send(rule_new)
      .expect(204);

    const response = await client
      .get(prefix + '/rule/' + rule.id)
      .expect(200);

    expect(response.body).to.containDeep({name: 'new rule name.'});
  });

  it('put ' + prefix + '/rule/{id}: non-existing item', async () => {
    const rule = new Rule(
      createRuleObject({
        name: 'new rule name.',
      }),
    );
    await client
      .put(prefix + '/rule/' + rule.id)
      .send(rule)
      .expect(404);
  });
});
