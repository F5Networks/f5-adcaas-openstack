import {Client, expect, toJSON} from '@loopback/testlab';
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
  givenMonitorData,
  giveMemberMonitorAssociationData,
} from '../helpers/database.helpers';
import {
  ShouldResponseWith,
  MockKeyStoneController,
  ExpectedData,
} from '../fixtures/controllers/mocks/mock.openstack.controller';
import uuid = require('uuid');

describe('MemberMonitorAssociationController', () => {
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

  it(
    'post ' +
      prefix +
      '/members/{memberId}/monitors/{monitorId}: non-existing Monitor',
    async () => {
      await client
        .post(prefix + '/members/1234/monitors/non-existing')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send()
        .expect(404);
    },
  );

  it(
    'post ' + prefix + '/members/{memberId}/montiors/{monitorId}',
    async () => {
      let monitor = await givenMonitorData(wafapp);
      let member = await givenMemberData(wafapp, {poolId: uuid()});
      await client
        .post(prefix + '/members/' + member.id + '/monitors/' + monitor.id)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send()
        .expect(204);
    },
  );

  it(
    'get ' +
      prefix +
      '/members/{id}/monitors: find Monitors associated with a Member',
    async () => {
      let monitor = await givenMonitorData(wafapp);
      let assoc = await giveMemberMonitorAssociationData(wafapp, {
        monitorId: monitor.id,
      });

      let response = await client
        .get(prefix + '/members/' + assoc.memberId + '/monitors')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);
      expect(toJSON(monitor)).to.containDeep(response.body.monitors[0]);
    },
  );

  it(
    'get ' +
      prefix +
      '/members/{id}/monitors: no Monitor associated with a Member',
    async () => {
      await client
        .get(prefix + '/members/' + uuid() + '/monitors')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);
    },
  );

  it(
    'get ' +
      prefix +
      '/monitors/{id}/members: find Members associated with a Monitor',
    async () => {
      let member = await givenMemberData(wafapp, {poolId: uuid()});
      let assoc = await giveMemberMonitorAssociationData(wafapp, {
        memberId: member.id,
      });

      let response = await client
        .get(prefix + '/monitors/' + assoc.monitorId + '/members')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      expect(response.body.members[0]).to.containDeep(toJSON(member));
    },
  );

  it(
    'get ' +
      prefix +
      '/monitors/{id}/members: no Member associated with a Monitor',
    async () => {
      await client
        .get(prefix + '/monitors/' + uuid() + '/members')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);
    },
  );

  it(
    'get ' +
      prefix +
      '/monitors/{monitorid}/members/{memberId}: find a Member associated with a Monitor',
    async () => {
      let member = await givenMemberData(wafapp, {poolId: uuid()});
      let assoc = await giveMemberMonitorAssociationData(wafapp, {
        memberId: member.id,
      });

      let response = await client
        .get(prefix + '/monitors/' + assoc.monitorId + '/members/' + member.id)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      expect(response.body.member).to.containDeep(toJSON(member));
    },
  );

  it(
    'delete' +
      prefix +
      '/members/{memberId}/monitors/{monitorId}: deassociate non-existing association',
    async () => {
      await client
        .del(prefix + '/members/' + uuid() + '/monitors/' + uuid())
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(404);
    },
  );

  it(
    'delete ' +
      prefix +
      '/members/{memberId}/monitors/{monitorId}: deassociate Monitor from a Member',
    async () => {
      let member = await givenMemberData(wafapp, {poolId: uuid()});
      let monitor = await givenMonitorData(wafapp);
      let assoc = await giveMemberMonitorAssociationData(wafapp, {
        monitorId: monitor.id,
        memberId: member.id,
      });

      await client
        .get(
          prefix +
            '/members/' +
            assoc.memberId +
            '/monitors/' +
            assoc.monitorId,
        )
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      await client
        .del(
          prefix +
            '/members/' +
            assoc.memberId +
            '/monitors/' +
            assoc.monitorId,
        )
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(204);

      await client
        .get(
          prefix +
            '/members/' +
            assoc.memberId +
            '/monitors/' +
            assoc.monitorId,
        )
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(404);
    },
  );
});
