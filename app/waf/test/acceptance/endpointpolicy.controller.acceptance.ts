import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  createEndpointpolicyObject,
  givenEndpointpolicyData,
} from '../helpers/database.helpers';
import {Endpointpolicy} from '../../src/models';
import uuid = require('uuid');

describe('EndpointpolicyController', () => {
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

  it('post ' + prefix + '/endpointpolicies: with id', async () => {
    const epp = new Endpointpolicy(
      createEndpointpolicyObject({
        id: uuid(),
      }),
    );

    const response = await client
      .post(prefix + '/endpointpolicies')
      .send(epp)
      .expect(200);

    expect(response.body).to.containDeep(toJSON(epp));
  });

  it('post ' + prefix + '/endpointpolicies: with no id', async () => {
    const epp = new Endpointpolicy(createEndpointpolicyObject());

    const response = await client
      .post(prefix + '/endpointpolicies')
      .send(epp)
      .expect(200);

    expect(response.body).to.containDeep(toJSON(epp));
  });

  it('post ' + prefix + '/endpointpolicies: with duplicate id', async () => {
    const epp = await givenEndpointpolicyData(wafapp);

    await client
      .post(prefix + '/endpointpolicies')
      .send(epp)
      .expect(409);
  });

  it(
    'post ' + prefix + '/endpointpolicies: no endpointpolicy assocated',
    async () => {
      const epp = new Endpointpolicy(
        createEndpointpolicyObject({
          id: uuid(),
        }),
      );

      const response = await client
        .post(prefix + '/endpointpolicies')
        .send(epp)
        .expect(200);

      expect(response.body).to.containDeep(toJSON(epp));
    },
  );

  it('get ' + prefix + '/endpointpolicies: of all', async () => {
    const epp = await givenEndpointpolicyData(wafapp);

    await client
      .get(prefix + '/endpointpolicies')
      .expect(200, [toJSON(epp)])
      .expect('Content-Type', /application\/json/);
  });

  it('get ' + prefix + '/endpointpolicies: with filter string', async () => {
    const epp = await givenEndpointpolicyData(wafapp);

    await client
      .get(prefix + '/endpointpolicies')
      .query({filter: {where: {id: epp.id}}})
      .expect(200, [toJSON(epp)]);
  });

  it('get ' + prefix + '/endpointpolicies/count', async () => {
    let response = await client
      .get(prefix + '/endpointpolicies/count')
      .expect(200);
    expect(response.body.count).to.eql(0);

    const epp = await givenEndpointpolicyData(wafapp);

    response = await client
      .get(prefix + '/endpointpolicies/count')
      .query({where: {id: epp.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('patch ' + prefix + '/endpointpolicies: all items', async () => {
    await givenEndpointpolicyData(wafapp);
    await givenEndpointpolicyData(wafapp);

    const patched_name = {name: 'updated endpointpolicy name'};
    let response = await client
      .patch(prefix + '/endpointpolicies')
      .send(patched_name)
      .expect(200);

    expect(response.body.count).to.eql(2);

    response = await client
      .get(prefix + '/endpointpolicies/count')
      .query({where: patched_name})
      .expect(200);
    expect(response.body.count).to.eql(2);
  });

  it('patch ' + prefix + '/endpointpolicies: selected items', async () => {
    await givenEndpointpolicyData(wafapp);
    await givenEndpointpolicyData(wafapp);

    const patch_condition = {id: '1'};
    const patched_name = {name: 'updated endpointpolicy name'};
    await givenEndpointpolicyData(wafapp, patch_condition);

    let response = await client
      .patch(prefix + '/endpointpolicies')
      .query(patch_condition)
      .send(patched_name)
      .expect(200);

    expect(response.body.count).to.eql(3);

    response = await client
      .get(prefix + '/endpointpolicies/count')
      .query({where: patched_name})
      .expect(200);
    expect(response.body.count).to.eql(3);

    response = await client
      .get(prefix + '/endpointpolicies/count')
      .query({where: patch_condition})
      .expect(200);

    expect(response.body.count).to.eql(0);
  });

  it('get ' + prefix + '/endpointpolicies/{id}: selected item', async () => {
    await givenEndpointpolicyData(wafapp);
    const epp = await givenEndpointpolicyData(wafapp);

    await client
      .get(prefix + '/endpointpolicies/' + epp.id)
      .expect(200, toJSON(epp));
  });

  it('get ' + prefix + '/endpointpolicies/{id}: not found', async () => {
    await client.get(prefix + '/endpointpolicies/' + uuid()).expect(404);
  });

  it('patch ' + prefix + '/endpointpolicies/{id}: existing item', async () => {
    const patched_name = {name: 'new endpointpolicy name'};
    const epp = await givenEndpointpolicyData(wafapp);

    await client
      .patch(prefix + '/endpointpolicies/' + epp.id)
      .send(patched_name)
      .expect(204, '');
  });

  it(
    'patch ' + prefix + '/endpointpolicies/{id}: non-existing item',
    async () => {
      const patched_name = {name: 'new endpointpolicy name'};
      await client
        .patch(prefix + '/endpointpolicies/' + uuid())
        .send(patched_name)
        .expect(404);
    },
  );

  it(
    'delete ' + prefix + '/endpointpolicies/{id}: non-existing item',
    async () => {
      await client.del(prefix + '/endpointpolicies/' + uuid()).expect(404);
    },
  );

  it('delete ' + prefix + '/endpointpolicies/{id}: existing item', async () => {
    const epp = await givenEndpointpolicyData(wafapp);

    await client.del(prefix + '/endpointpolicies/' + epp.id).expect(204);
  });

  it('put' + prefix + '/endpointpolicies/{id}: existing item', async () => {
    const epp = await givenEndpointpolicyData(wafapp);

    const epp_new = new Endpointpolicy(
      createEndpointpolicyObject({
        name: 'new endpointpolicy name.',
      }),
    );
    await client
      .put(prefix + '/endpointpolicies/' + epp.id)
      .send(epp_new)
      .expect(204);

    const response = await client
      .get(prefix + '/endpointpolicies/' + epp.id)
      .expect(200);

    expect(response.body).to.containDeep({name: 'new endpointpolicy name.'});
  });

  it(
    'put ' + prefix + '/endpointpolicies/{id}: non-existing item',
    async () => {
      const epp = new Endpointpolicy(
        createEndpointpolicyObject({
          name: 'new endpointpolicy name.',
        }),
      );
      await client
        .put(prefix + '/endpointpolicies/' + epp.id)
        .send(epp)
        .expect(404);
    },
  );
});
