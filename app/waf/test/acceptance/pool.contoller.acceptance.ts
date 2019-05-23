import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {
  setupApplication,
  teardownApplication,
  TestingApplication,
  setupRestAppAndClient,
  RestApplicationPort,
  teardownRestAppAndClient,
  setupEnvs,
  teardownEnvs,
} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenPoolData,
  createPoolObject,
} from '../helpers/database.helpers';
import {
  ShouldResponseWith,
  MockKeyStoneController,
  ExpectedData,
} from '../fixtures/controllers/mocks/mock.openstack.controller';

describe('PoolController', () => {
  let wafapp: WafApplication;
  let client: Client;
  let mockKeystoneApp: TestingApplication;

  const prefix = '/adcaas/v1';

  before('setupApplication', async () => {
    mockKeystoneApp = await (async () => {
      let {restApp} = await setupRestAppAndClient(
        RestApplicationPort.IdentityAdmin,
        MockKeyStoneController,
      );
      return restApp;
    })();

    ({wafapp, client} = await setupApplication());
    ShouldResponseWith({});
    setupEnvs();
  });

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
  });

  after(async () => {
    await teardownApplication(wafapp);
    teardownRestAppAndClient(mockKeystoneApp);
    teardownEnvs();
  });

  it('post ' + prefix + '/pools', async () => {
    const pool = createPoolObject();

    const response = await client
      .post(prefix + '/pools')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(pool)
      .expect(200);
    expect(response.body.pool.id)
      .to.not.empty()
      .and.type('string');
    expect(response.body.pool).to.containDeep(toJSON(pool));
  });

  it('get ' + prefix + '/pools', async () => {
    const pool = await givenPoolData(wafapp);

    const response = await client
      .get(prefix + '/pools')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(toJSON(pool)).to.containDeep(response.body.pools[0]);
  });

  it('get ' + prefix + '/pools/{id}', async () => {
    const pool = await givenPoolData(wafapp);

    const response = await client
      .get(prefix + `/pools/${pool.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(response.body.pool.id).equal(pool.id);
  });

  it('patch ' + prefix + '/pools/{id}', async () => {
    const pool = await givenPoolData(wafapp);
    // pzhang(NOTE): return no content
    pool.name = 'test';

    await client
      .patch(prefix + `/pools/${pool.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(pool)
      .expect(204);

    await client
      .get(prefix + `/pools/${pool.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
  });

  it('delete ' + prefix + '/pools/{id}', async () => {
    const pool = await givenPoolData(wafapp);

    await client
      .del(prefix + `/pools/${pool.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(204);

    await client
      .get(prefix + `/pools/${pool.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });
});
