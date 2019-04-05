import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenPoolData,
  createPoolObject,
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
    const pool = createPoolObject();

    const response = await client
      .post(prefix + '/pools')
      .send(pool)
      .expect(200);
    expect(response.body.pool.id)
      .to.not.empty()
      .and.type('string');
    expect(response.body.pool).to.containDeep(toJSON(pool));
  });

  it('get ' + prefix + '/pools', async () => {
    const pool = await givenPoolData(wafapp);

    const response = await client.get(prefix + '/pools').expect(200);
    expect(toJSON(pool)).to.containDeep(response.body.pools[0]);
  });

  it('get ' + prefix + '/pools/{id}', async () => {
    const pool = await givenPoolData(wafapp);

    const response = await client.get(prefix + `/pools/${pool.id}`).expect(200);

    expect(response.body.pool.id).equal(pool.id);
  });

  it('patch ' + prefix + '/pools/{id}', async () => {
    const pool = await givenPoolData(wafapp);
    // pzhang(NOTE): return no content
    pool.name = 'test';

    await client
      .patch(prefix + `/pools/${pool.id}`)
      .send(pool)
      .expect(204);

    await client.get(prefix + `/pools/${pool.id}`).expect(200);
  });

  it('delete ' + prefix + '/pools/{id}', async () => {
    const pool = await givenPoolData(wafapp);

    await client.del(prefix + `/pools/${pool.id}`).expect(204);

    await client.get(prefix + `/pools/${pool.id}`).expect(404);
  });
});
