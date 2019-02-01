// Copyright F5 Networks, Inc. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givePoolData,
  createPoolObjectWithoutID,
} from '../helpers/database.helpers';

describe('PoolController', () => {
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

  it('post ' + prefix + '/pools', async () => {
    const pool = createPoolObjectWithoutID();

    const response = await client
      .post(prefix + '/pools')
      .send(pool)
      .expect(200);

    expect(response.body.id)
      .to.not.empty()
      .and.type('string');
    expect(response.body).to.containDeep(pool);
  });

  it('get ' + prefix + '/pools/count', async () => {
    const pool = await givePoolData(wafapp);

    const response = await client
      .get(prefix + '/pools/count')
      .query({where: {id: pool.id}})
      .expect(200);

    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/pools', async () => {
    const pool = await givePoolData(wafapp);

    await client
      .get(prefix + '/pools')
      .query({where: {class: pool.class}})
      .expect(200, [toJSON(pool)]);
  });

  it('get ' + prefix + '/pools', async () => {
    const pool = await givePoolData(wafapp);

    await client
      .get(prefix + '/pools')
      .query({filter: {where: {class: pool.class}}})
      .expect(200, [toJSON(pool)]);
  });

  it('patch ' + prefix + '/pools', async () => {
    const poolObject = createPoolObjectWithoutID();

    const pool = await givePoolData(wafapp);

    // pzhang(NOTE): return a count
    const response = await client
      .patch(prefix + `/pools`)
      .query({where: {class: pool.class}})
      .send(poolObject)
      .expect(200);

    expect(response.body.count).to.equal(1);

    // pzhang(NOTE): id will not change in generic patch with id method.
    poolObject.id = pool.id;

    await client
      .get(prefix + `/pools/${pool.id}`)
      .expect(200, toJSON(poolObject));
  });

  it('get ' + prefix + '/pools/{id}', async () => {
    const pool = await givePoolData(wafapp);

    await client.get(prefix + `/pools/${pool.id}`).expect(200, toJSON(pool));
  });

  it('patch ' + prefix + '/pools/{id}', async () => {
    const poolObject = createPoolObjectWithoutID();

    const pool = await givePoolData(wafapp);
    // pzhang(NOTE): return no content
    await client
      .patch(prefix + `/pools/${pool.id}`)
      .send(poolObject)
      .expect(204);

    // pzhang(NOTE): id will not change in generic patch with id method.
    poolObject.id = pool.id;

    await client
      .get(prefix + `/pools/${pool.id}`)
      .expect(200, toJSON(poolObject));
  });

  it('put ' + prefix + '/pools/{id}', async () => {
    const pool = await givePoolData(wafapp);

    const poolObject = createPoolObjectWithoutID();

    await client
      .put(prefix + `/pools/${pool.id}`)
      .send(poolObject)
      .expect(204);

    poolObject.id = pool.id;

    await client
      .get(prefix + `/pools/${pool.id}`)
      .expect(200, toJSON(poolObject));
  });

  it('delete ' + prefix + '/pools/{id}', async () => {
    const pool = await givePoolData(wafapp);

    await client.del(prefix + `/pools/${pool.id}`).expect(204);

    await client.get(prefix + `/pools/${pool.id}`).expect(404);
  });
});
