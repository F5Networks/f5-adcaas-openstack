// Copyright F5 Networks, Inc. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenWafpolicyData,
  createWafpolicyObject,
} from '../helpers/database.helpers';
import {Wafpolicy} from '../../src/models';
import {v4 as uuid} from 'uuid';

describe('WafpolicyController', () => {
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
    await wafapp.stop();
  });

  it('post ' + prefix + '/wafpolicies: with id', async () => {
    const wafpolicy = new Wafpolicy(createWafpolicyObject({id: uuid()}));

    const response = await client
      .post(prefix + '/wafpolicies')
      .send(wafpolicy)
      .expect(200);

    expect(response.body).to.containDeep(toJSON(wafpolicy));
  });

  it('post ' + prefix + '/wafpolicies: with no id', async () => {
    const wafpolicy = new Wafpolicy(createWafpolicyObject());

    const response = await client
      .post(prefix + '/wafpolicies')
      .send(wafpolicy)
      .expect(200);

    expect(response.body).to.containDeep(toJSON(wafpolicy));
  });

  it('post ' + prefix + '/wafpolicies: with duplicate id', async () => {
    const wafpolicy = await givenWafpolicyData(wafapp);

    await client
      .post(prefix + '/wafpolicies')
      .send(wafpolicy)
      .expect(400);
  });

  it('get ' + prefix + '/wafpolicies: of all', async () => {
    const wafpolicy = await givenWafpolicyData(wafapp);

    await client
      .get(prefix + '/wafpolicies')
      .expect(200, [toJSON(wafpolicy)])
      .expect('Content-Type', /application\/json/);
  });

  it('get ' + prefix + '/wafpolicies: with filter string', async () => {
    const wafpolicy = await givenWafpolicyData(wafapp);

    await client
      .get(prefix + '/wafpolicies')
      .query({filter: {where: {id: wafpolicy.id}}})
      .expect(200, [toJSON(wafpolicy)]);
  });

  it('get ' + prefix + '/wafpolicies/count', async () => {
    let response = await client.get(prefix + '/wafpolicies/count').expect(200);
    expect(response.body.count).to.eql(0);

    const wafpolicy = await givenWafpolicyData(wafapp);

    response = await client
      .get(prefix + '/wafpolicies/count')
      .query({where: {id: wafpolicy.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('patch ' + prefix + '/wafpolicies: all items', async () => {
    await givenWafpolicyData(wafapp);
    await givenWafpolicyData(wafapp);

    const patched_name = {name: 'updated waf policy name'};
    let response = await client
      .patch(prefix + '/wafpolicies')
      .send(patched_name)
      .expect(200);

    expect(response.body.count).to.eql(2);

    response = await client
      .get(prefix + '/wafpolicies/count')
      .query({where: patched_name})
      .expect(200);
    expect(response.body.count).to.eql(2);
  });

  it('patch ' + prefix + '/wafpolicies: selected items', async () => {
    await givenWafpolicyData(wafapp);
    await givenWafpolicyData(wafapp);

    const patch_condition = {content: 'the only one to patch'};
    const patched_name = {name: 'updated waf policy name'};

    await givenWafpolicyData(wafapp, patch_condition);

    let response = await client
      .patch(prefix + '/wafpolicies')
      .query({where: patch_condition})
      .send(patched_name)
      .expect(200);

    expect(response.body.count).to.eql(1);

    response = await client
      .get(prefix + '/wafpolicies/count')
      .query({where: patched_name})
      .expect(200);
    expect(response.body.count).to.eql(1);

    response = await client
      .get(prefix + '/wafpolicies/count')
      .query({where: patch_condition})
      .expect(200);

    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/wafpolicies/{id}: selected item', async () => {
    await givenWafpolicyData(wafapp);
    const wafpolicy = await givenWafpolicyData(wafapp);

    await client
      .get(prefix + '/wafpolicies/' + wafpolicy.id)
      .expect(200, toJSON(wafpolicy));
  });

  it('get ' + prefix + '/wafpolicies/{id}: not found', async () => {
    await client.get(prefix + '/wafpolicies/' + uuid()).expect(404);
  });

  it('patch ' + prefix + '/wafpolicies/{id}: existing item', async () => {
    const patched_name = {name: 'new waf policy name'};
    const wafpolicy = await givenWafpolicyData(wafapp);

    await client
      .patch(prefix + '/wafpolicies/' + wafpolicy.id)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/wafpolicies/{id}: non-existing item', async () => {
    const patched_name = {name: 'new waf policy name'};
    await client
      .patch(prefix + '/wafpolicies/' + uuid())
      .send(patched_name)
      .expect(404);
  });

  it('delete ' + prefix + '/wafpolicies/{id}: non-existing item', async () => {
    await client.del(prefix + '/wafpolicies/' + uuid()).expect(404);
  });

  it('delete ' + prefix + '/wafpolicies/{id}: existing item', async () => {
    const wafpolicy = await givenWafpolicyData(wafapp);

    await client.del(prefix + '/wafpolicies/' + wafpolicy.id).expect(204);
  });

  it('put' + prefix + '/wafpolicies/{id}: existing item', async () => {
    const wafpolicy = await givenWafpolicyData(wafapp);

    const wafpolicy_new = new Wafpolicy(
      createWafpolicyObject({
        name: 'new waf policy name.',
      }),
    );
    await client
      .put(prefix + '/wafpolicies/' + wafpolicy.id)
      .send(wafpolicy_new)
      .expect(204);

    const response = await client
      .get(prefix + '/wafpolicies/' + wafpolicy.id)
      .expect(200);

    expect(response.body).to.containDeep({name: 'new waf policy name.'});
  });

  it('put ' + prefix + '/wafpolicies/{id}: non-existing item', async () => {
    const wafpolicy = new Wafpolicy(
      createWafpolicyObject({
        name: 'new waf policy name.',
      }),
    );
    await client
      .put(prefix + '/wafpolicies/' + wafpolicy.id)
      .send(wafpolicy)
      .expect(404);
  });
});
