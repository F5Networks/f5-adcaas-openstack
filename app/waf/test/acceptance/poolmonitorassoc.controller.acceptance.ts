import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenPoolData,
  givenMonitorData,
  givePoolMonitorAssociationData,
} from '../helpers/database.helpers';
import uuid = require('uuid');

describe('PoolMonitorAssociationController', () => {
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

  it('post ' + prefix + '/pools/{poolId}/monitors/{monitorId}', async () => {
    let pool = await givenPoolData(wafapp);
    let monitor = await givenMonitorData(wafapp);
    await client
      .post(prefix + '/pools/' + pool.id + '/monitors/' + monitor.id)
      .send()
      .expect(204);
  });

  it(
    'post ' +
      prefix +
      '/pools/{poolId}/monitors/{monitorId}: non-existing Pool',
    async () => {
      await client
        .post(prefix + '/pools/non-existing/monitors/any')
        .send()
        .expect(404);
    },
  );

  it(
    'post ' +
      prefix +
      '/pools/{poolId}/monitors/{monitorId}: non-existing Monitor',
    async () => {
      let pool = await givenPoolData(wafapp);
      await client
        .post(prefix + '/pools/' + pool.id + '/monitors/non-existing')
        .send()
        .expect(404);
    },
  );

  it(
    'get ' +
      prefix +
      '/pools/{id}/monitors: find monitors associated with a Pool',
    async () => {
      let pool = await givenPoolData(wafapp);
      let monitor = await givenMonitorData(wafapp);
      await givePoolMonitorAssociationData(wafapp, {
        poolId: pool.id,
        monitorId: monitor.id,
      });

      let response = await client
        .get(prefix + '/pools/' + pool.id + '/monitors')
        .expect(200);
      expect(toJSON(monitor)).to.containDeep(response.body.monitors[0]);
    },
  );

  it(
    'get ' +
      prefix +
      '/pools/{poolId}/monitors/{monitorId}: find Monitor associated with a Pool',
    async () => {
      let pool = await givenPoolData(wafapp);
      let monitor = await givenMonitorData(wafapp);
      await givePoolMonitorAssociationData(wafapp, {
        poolId: pool.id,
        monitorId: monitor.id,
      });

      let response = await client
        .get(prefix + '/pools/' + pool.id + '/monitors/' + monitor.id)
        .expect(200);

      expect(toJSON(monitor)).to.containDeep(response.body.monitor);
    },
  );

  it(
    'get ' + prefix + '/pools/{id}/monitors: no Monitor associated with a Pool',
    async () => {
      let pool = await givenPoolData(wafapp);
      await client.get(prefix + '/pools/' + pool.id + '/monitors').expect(200);
    },
  );

  it(
    'get ' +
      prefix +
      '/pools/{poolId}/monitors/{monitorId}: no Monitor associated with a Pool',
    async () => {
      let pool = await givenPoolData(wafapp);
      let monitor = await givenMonitorData(wafapp);
      await client
        .get(prefix + '/pools/' + pool.id + '/monitors/' + monitor.id)
        .expect(404);
    },
  );

  it(
    'get ' +
      prefix +
      '/monitors/{monitorId}/pools: find Pools associated with a Monitor',
    async () => {
      let pool = await givenPoolData(wafapp);
      let monitor = await givenMonitorData(wafapp);
      await givePoolMonitorAssociationData(wafapp, {
        poolId: pool.id,
        monitorId: monitor.id,
      });

      let response = await client
        .get(prefix + '/monitors/' + monitor.id + '/pools')
        .expect(200);
      expect(toJSON(pool)).to.containDeep(response.body.pools[0]);
    },
  );

  it(
    'get ' +
      prefix +
      '/monitors/{monitorId}/pools/{poolId}: find Pool associated with a Monitor',
    async () => {
      let pool = await givenPoolData(wafapp);
      let monitor = await givenMonitorData(wafapp);
      await givePoolMonitorAssociationData(wafapp, {
        poolId: pool.id,
        monitorId: monitor.id,
      });

      let response = await client
        .get(prefix + '/monitors/' + monitor.id + '/pools/' + pool.id)
        .expect(200);

      expect(toJSON(pool)).to.containDeep(response.body.pool);
    },
  );

  it(
    'get ' +
      prefix +
      '/monitors/{monitorId}/pools: no Pool associated with a Monitor',
    async () => {
      let monitor = await givenMonitorData(wafapp);
      await client
        .get(prefix + '/monitors/' + monitor.id + '/pools')
        .expect(200);
    },
  );

  it(
    'get ' +
      prefix +
      '/monitors/{monitorId}/pools/{poolId}: no Pool associated with a Monitor',
    async () => {
      let pool = await givenPoolData(wafapp);
      let monitor = await givenMonitorData(wafapp);
      await client
        .get(prefix + '/monitors/' + monitor.id + '/pools/' + pool.id)
        .expect(404);
    },
  );

  it(
    'delete' +
      prefix +
      '/pools/{poolId}/monitors/{monitorId}: deassociate non-existing association',
    async () => {
      await client
        .del(prefix + '/pools/' + uuid() + '/monitors/' + uuid())
        .expect(204);
    },
  );

  it(
    'delete ' +
      prefix +
      '/pools/{poolId}/monitors/{monitorId}: deassociate Monitor from a Pool',
    async () => {
      let pool = await givenPoolData(wafapp);
      let monitor = await givenMonitorData(wafapp);
      let assoc = await givePoolMonitorAssociationData(wafapp, {
        poolId: pool.id,
        monitorId: monitor.id,
      });

      await client
        .get(prefix + '/pools/' + assoc.poolId + '/monitors/' + assoc.monitorId)
        .expect(200);

      await client
        .del(prefix + '/pools/' + assoc.poolId + '/monitors/' + assoc.monitorId)
        .expect(204);

      await client
        .get(prefix + '/pools/' + assoc.poolId + '/monitors/' + assoc.monitorId)
        .expect(404);
    },
  );
});
