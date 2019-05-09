import {Client, expect} from '@loopback/testlab';
import {WafApplication} from '../..';
import {
  setupApplication,
  teardownApplication,
  TestingApplication,
  setupRestAppAndClient,
  RestApplicationPort,
  teardownRestAppAndClient,
} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenMemberData,
  givenPoolData,
  createMemberObject,
} from '../helpers/database.helpers';
import uuid = require('uuid');
import {
  ShouldResponseWith,
  MockKeyStoneController,
  ExpectedData,
} from '../fixtures/controllers/mocks/mock.openstack.controller';

describe('MemberController', () => {
  let wafapp: WafApplication;
  let client: Client;
  let mockKeystoneApp: TestingApplication;

  const prefix = '/adcaas/v1';

  let envs: {[key: string]: string} = {
    OS_AUTH_URL: 'http://localhost:35357/v2.0',
    OS_USERNAME: 'wafaas',
    OS_PASSWORD: '91153c85b8dd4147',
    OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
    OS_DOMAIN_NAME: 'Default',
    OS_REGION_NAME: 'RegionOne',
    OS_AVAILABLE_ZONE: 'nova',
  };

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

  let setupEnvs = async () => {
    process.env.PRODUCT_RELEASE = '1';
    for (let env of Object.keys(envs)) {
      process.env[env] = envs[env];
    }
  };

  let teardownEnvs = async () => {
    delete process.env['PRODUCT_RELEASE'];
    for (let env of Object.keys(envs)) {
      delete process.env[env];
    }
  };

  after(async () => {
    await teardownApplication(wafapp);
    teardownRestAppAndClient(mockKeystoneApp);
    teardownEnvs();
  });

  it('post ' + prefix + '/pools/{pool_id}/members', async () => {
    const pool = await givenPoolData(wafapp);
    const member = createMemberObject({id: uuid()});

    const response = await client
      .post(prefix + `/pools/${pool.id}/members`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(member)
      .expect(200);

    expect(response.body.member.id)
      .to.not.empty()
      .and.type('string');
  });

  it('get ' + prefix + '/pools/{pool_id}/members/{member_id}', async () => {
    const pool = await givenPoolData(wafapp);
    const member = await givenMemberData(wafapp, {id: uuid(), poolId: pool.id});

    const response = await client
      .get(prefix + `/pools/${pool.id}/members/${member.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(response.body.members[0].id)
      .to.not.empty()
      .and.type('string');
  });

  it('get ' + prefix + '/pools/{pool_id}/members', async () => {
    const pool = await givenPoolData(wafapp);
    await givenMemberData(wafapp, {id: uuid(), poolId: pool.id});
    await givenMemberData(wafapp, {id: uuid(), poolId: pool.id});

    const response = await client
      .get(prefix + `/pools/${pool.id}/members`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(response.body.members)
      .be.instanceOf(Array)
      .and.have.length(2);
  });

  it('delete ' + prefix + '/pools/{pool_id}/members/{member_id}', async () => {
    const pool = await givenPoolData(wafapp);
    const member = await givenMemberData(wafapp, {id: uuid(), poolId: pool.id});

    await client
      .del(prefix + `/pools/${pool.id}/members/${member.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(204);

    await client
      .get(prefix + `/pools/${pool.id}/members/${member.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
  });

  it('patch ' + prefix + '/pools/{pool_id}/members/{member_id}', async () => {
    const pool = await givenPoolData(wafapp);
    const memberInDb = await givenMemberData(wafapp, {
      id: uuid(),
      poolId: pool.id,
    });
    const member = createMemberObject({
      id: memberInDb.id,
      port: 4789,
    });

    await client
      .patch(prefix + `/pools/${pool.id}/members/${member.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(member)
      .expect(204);
  });
});
