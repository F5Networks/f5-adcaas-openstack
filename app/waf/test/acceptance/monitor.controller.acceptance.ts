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
  createMonitorObject,
  givenMonitorData,
} from '../helpers/database.helpers';
import {
  ShouldResponseWith,
  MockKeyStoneController,
  ExpectedData,
} from '../fixtures/controllers/mocks/mock.openstack.controller';

describe('MointorController', () => {
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

  it('post ' + prefix + '/monitors', async () => {
    const monitor = createMonitorObject();

    const response = await client
      .post(prefix + '/monitors')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(monitor)
      .expect(200);

    expect(response.body.monitor.id)
      .to.not.empty()
      .and.type('string');
    expect(response.body.monitor).to.containDeep(toJSON(monitor));
  });

  it('get ' + prefix + '/monitors', async () => {
    const monitor = await givenMonitorData(wafapp);
    const response = await client
      .get(prefix + '/monitors')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(toJSON(monitor)).to.containDeep(response.body.monitors[0]);
  });

  it('get ' + prefix + '/monitors/{id}', async () => {
    const monitor = await givenMonitorData(wafapp);

    const response = await client
      .get(prefix + `/monitors/${monitor.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(response.body.monitor.id).equal(monitor.id);
  });

  it('patch ' + prefix + '/monitors/{id}', async () => {
    const monitor = await givenMonitorData(wafapp);

    const monitorObject = createMonitorObject({
      id: monitor.id,
      interval: 10,
      targetAddress: '192.0.1.23',
      targetPort: 22,
      monitorType: 'tcp',
      timeout: 16,
    });

    // return no content
    await client
      .patch(prefix + `/monitors/${monitor.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(monitorObject)
      .expect(204);

    await client
      .get(prefix + `/monitors/${monitor.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
  });

  it('delete ' + prefix + '/monitors/{id}', async () => {
    const monitor = await givenMonitorData(wafapp);
    await client
      .del(prefix + `/monitors/${monitor.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(204);
    await client
      .get(prefix + `/monitors/${monitor.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });
});
