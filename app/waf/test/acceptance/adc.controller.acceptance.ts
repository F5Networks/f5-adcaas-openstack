// Copyright F5 Networks, Inc. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenAdcData,
  createAdcObject,
} from '../helpers/database.helpers';
import {Adc} from '../../src/models';
import {v4 as uuid} from 'uuid';

describe('AdcController', () => {
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

  it('post ' + prefix + '/adcs', async () => {
    const adc = new Adc(createAdcObject({id: uuid()}));

    const response = await client
      .post(prefix + '/adcs')
      .send(adc)
      .expect(200);

    expect(response.body).to.containDeep(toJSON(adc));
  });

  it('get ' + prefix + '/adcs: of all', async () => {
    const adc = await givenAdcData(wafapp);

    await client
      .get(prefix + '/adcs')
      .expect(200, [toJSON(adc)])
      .expect('Content-Type', /application\/json/);
  });

  it('get ' + prefix + '/adcs: with filter string', async () => {
    const adc = await givenAdcData(wafapp);

    await client
      .get(prefix + '/adcs')
      .query({filter: {where: {id: adc.id}}})
      .expect(200, [toJSON(adc)]);
  });

  it('get ' + prefix + '/adcs/count', async () => {
    let response = await client.get(prefix + '/adcs/count').expect(200);
    expect(response.body.count).to.eql(0);

    const adc = await givenAdcData(wafapp);

    response = await client
      .get(prefix + '/adcs/count')
      .query({where: {id: adc.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('patch ' + prefix + '/adcs: all items', async () => {
    await givenAdcData(wafapp);
    await givenAdcData(wafapp);

    const patched_name = {name: 'new adc target'};
    let response = await client
      .patch(prefix + '/adcs')
      .send(patched_name)
      .expect(200);

    expect(response.body.count).to.eql(2);

    response = await client
      .get(prefix + '/adcs/count')
      .query({where: patched_name})
      .expect(200);
    expect(response.body.count).to.eql(2);
  });

  it('patch ' + prefix + '/adcs: selected items', async () => {
    await givenAdcData(wafapp);
    await givenAdcData(wafapp);

    const patch_condition = {passphrase: 'the only one to patch'};
    const patched_name = {name: 'updated adc name'};
    await givenAdcData(wafapp, patch_condition);

    let response = await client
      .patch(prefix + '/adcs')
      .query({where: patch_condition})
      .send(patched_name)
      .expect(200);

    expect(response.body.count).to.eql(1);

    response = await client
      .get(prefix + '/adcs/count')
      .query({where: patched_name})
      .expect(200);
    expect(response.body.count).to.eql(1);

    response = await client
      .get(prefix + '/adcs/count')
      .query({where: patch_condition})
      .expect(200);

    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/adcs/{id}: selected item', async () => {
    await givenAdcData(wafapp);
    const adc = await givenAdcData(wafapp);

    await client.get(prefix + '/adcs/' + adc.id).expect(200, toJSON(adc));
  });

  it('get ' + prefix + '/adcs/{id}: not found', async () => {
    await client.get(prefix + '/adcs/' + uuid()).expect(404);
  });

  it('patch ' + prefix + '/adcs/{id}: existing item', async () => {
    const patched_name = {name: 'new adc name'};
    const adc = await givenAdcData(wafapp);

    await client
      .patch(prefix + '/adcs/' + adc.id)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/adcs/{id}: non-existing item', async () => {
    const patched_name = {name: 'new adc name'};
    await client
      .patch(prefix + '/adcs/' + uuid())
      .send(patched_name)
      .expect(404);
  });

  it('delete ' + prefix + '/adcs/{id}: non-existing item', async () => {
    await client.del(prefix + '/adcs/' + uuid()).expect(404);
  });

  it('delete ' + prefix + '/adcs/{id}: existing item', async () => {
    const adc = await givenAdcData(wafapp);

    await client.del(prefix + '/adcs/' + adc.id).expect(204);
  });

  it('put' + prefix + '/adcs/{id}: existing item', async () => {
    const adc = await givenAdcData(wafapp);

    const wafpolicy_new = new Adc(
      createAdcObject({
        name: 'new adc name.',
      }),
    );
    await client
      .put(prefix + '/adcs/' + adc.id)
      .send(wafpolicy_new)
      .expect(204);

    const response = await client.get(prefix + '/adcs/' + adc.id).expect(200);

    expect(response.body).to.containDeep({name: 'new adc name.'});
  });

  it('put ' + prefix + '/adcs/{id}: non-existing item', async () => {
    const adc = new Adc(
      createAdcObject({
        name: 'new adc name.',
      }),
    );
    await client
      .put(prefix + '/adcs/' + adc.id)
      .send(adc)
      .expect(404);
  });
});
