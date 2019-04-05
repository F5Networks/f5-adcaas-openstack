import {expect, Client} from '@loopback/testlab';
import {
  setupRestAppAndClient,
  RestAppAndClient,
  teardownRestAppAndClient,
  TestingApplication,
  RestApplicationPort,
} from '../helpers/test-helper';
import {MockSelfTestController} from '../fixtures/controllers/mocks/mock.selftest.controller';

describe('openstack integration acceptance test', () => {
  let restAppAndClient: RestAppAndClient;
  let client: Client;
  let restApp: TestingApplication;

  before('setup', async () => {
    restAppAndClient = await setupRestAppAndClient(
      RestApplicationPort.RestSelfTest,
      MockSelfTestController,
    );

    client = restAppAndClient.client;
    restApp = restAppAndClient.restApp;
  });
  after('teardown', () => {
    teardownRestAppAndClient(restApp);
  });

  it('mock self test ok', async () => {
    const response = await client
      .get('/test-openstack-simulation-ok')
      .expect(200);
    expect(response.body).to.containDeep({status: 'ok'});
  });
});
