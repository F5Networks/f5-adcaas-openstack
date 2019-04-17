import {
  TestingApplication,
  setupRestAppAndClient,
  RestApplicationPort,
  teardownRestAppAndClient,
} from '../helpers/test-helper';
import {
  MockKeyStoneController,
  ShouldResponseWith,
  ExpectedData,
} from '../fixtures/controllers/mocks/mock.openstack.controller';
import {MockSelfTestController} from '../fixtures/controllers/mocks/mock.selftest.controller';
import {Client, expect} from '@loopback/testlab';
import {OpenStackComponent} from '../../src/components';
import {stubLogger, restoreLogger} from '../helpers/logging.helpers';
import {MySequence} from '../../src/sequence';

describe('openstack.identity.test', () => {
  let mockKeystoneApp: TestingApplication;
  let mockKeyStoneClient: Client;

  let testApp: TestingApplication;
  let client: Client;

  let envs: {[key: string]: string} = {
    OS_AUTH_URL: 'http://localhost:35357/v2.0',
    OS_USERNAME: 'wafaas',
    OS_PASSWORD: '91153c85b8dd4147',
    OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
    OS_DOMAIN_NAME: 'Default',
    OS_REGION_NAME: 'RegionOne',
    OS_AVAILABLE_ZONE: 'nova',
  };

  before('setup', async () => {
    let mockIdAppClient = await setupRestAppAndClient(
      RestApplicationPort.IdentityAdmin,
      MockKeyStoneController,
    );
    mockKeystoneApp = mockIdAppClient.restApp;
    mockKeyStoneClient = mockIdAppClient.client;

    let restAppAndClient = await setupRestAppAndClient(
      RestApplicationPort.WafApp,
      MockSelfTestController,
    );
    testApp = restAppAndClient.restApp;
    testApp.component(OpenStackComponent);
    testApp.sequence(MySequence);
    client = restAppAndClient.client;

    stubLogger();

    ShouldResponseWith({});
  });

  beforeEach('setup environs', async () => {
    process.env.PRODUCT_RELEASE = '1';
    for (let env of Object.keys(envs)) {
      process.env[env] = envs[env];
    }
  });

  afterEach('teardown environs', async () => {
    delete process.env['PRODUCT_RELEASE'];
    for (let env of Object.keys(envs)) {
      delete process.env[env];
    }
  });

  after('teardown', async () => {
    restoreLogger();
    teardownRestAppAndClient(testApp);
    teardownRestAppAndClient(mockKeystoneApp);
  });

  it('test openstack identity mocker is runninng.', async () => {
    let response = await mockKeyStoneClient.post('/v2.0/tokens').expect(200);

    expect(response.body).containDeep({
      access: {
        token: {
          id: ExpectedData.userToken,
        },
      },
    });
  });

  it('no auth to request, PRODUCT_RELEASE is off', async () => {
    delete process.env['PRODUCT_RELEASE'];
    let response = await client
      .get('/test-openstack-simulation-ok')
      .expect(200);

    expect(response.body).containDeep({status: 'ok'});
  });

  it('failed auth to request: no x-auth-token header', async () => {
    process.env.PRODUCT_RELEASE = '1';

    let response = await client
      .get('/test-openstack-simulation-ok')
      .expect(401);

    expect(response.body).containDeep({
      error: {message: 'Unauthorized: invalid X-Auth-Token header.'},
    });
  });

  it('succeed auth to request with x-auth-token header', async () => {
    let response = await client
      .get('/test-openstack-simulation-ok')
      .set('X-Auth-Token', ExpectedData.userToken)
      .send()
      .expect(200);

    expect(response.body).containDeep({status: 'ok'});
  });
});
