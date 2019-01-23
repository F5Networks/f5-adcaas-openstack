// Copyright F5 Networks, Inc. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenApplicationData,
  createApplicationObject,
} from '../helpers/database.helpers';
import {Application} from '../../src/models';
import {v4 as uuid} from 'uuid';

describe('ApplicationController', () => {
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

  it('post ' + prefix + '/applications', async () => {
    const application = new Application(createApplicationObject({id: uuid()}));

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
});
