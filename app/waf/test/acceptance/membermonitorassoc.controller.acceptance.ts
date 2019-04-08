import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenMemberData,
  givenMonitorData,
  giveMemberMonitorAssociationData,
} from '../helpers/database.helpers';
import uuid = require('uuid');

describe('MemberMonitorAssociationController', () => {
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

  it(
    'post ' +
      prefix +
      '/members/{memberId}/monitors/{monitorId}: non-existing Monitor',
    async () => {
      await client
        .post(prefix + '/members/1234/monitors/non-existing')
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
        .expect(200);
      expect(toJSON(monitor)).to.containDeep(response.body.monitors[0]);
    },
  );

  it(
    'get ' +
      prefix +
      '/members/{id}/monitors: no Monitor associated with a Member',
    async () => {
      await client.get(prefix + '/members/' + uuid() + '/monitors').expect(200);
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
        .expect(200);

      expect(response.body.members[0]).to.containDeep(toJSON(member));
    },
  );

  it(
    'get ' +
      prefix +
      '/monitors/{id}/members: no Member associated with a Monitor',
    async () => {
      await client.get(prefix + '/monitors/' + uuid() + '/members').expect(200);
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
        .expect(204);
    },
  );

  it(
    'delete ' +
      prefix +
      '/members/{memberId}/monitors/{monitorId}: deassociate Monitor from a Member',
    async () => {
      let monitor = await givenMonitorData(wafapp);
      let assoc = await giveMemberMonitorAssociationData(wafapp, {
        monitorId: monitor.id,
      });

      await client
        .get(
          prefix +
            '/members/' +
            assoc.memberId +
            '/monitors/' +
            assoc.monitorId,
        )
        .expect(200);

      await client
        .del(
          prefix +
            '/members/' +
            assoc.memberId +
            '/monitors/' +
            assoc.monitorId,
        )
        .expect(204);

      await client
        .get(
          prefix +
            '/members/' +
            assoc.memberId +
            '/monitors/' +
            assoc.monitorId,
        )
        .expect(404);
    },
  );
});
