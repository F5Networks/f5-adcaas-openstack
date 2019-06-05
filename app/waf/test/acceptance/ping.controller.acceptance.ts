import {Client, expect, sinon} from '@loopback/testlab';
import {WafApplication} from '../..';
import {ApplicationController} from '../../src/controllers';
import {AS3Service} from '../../src/services';
import {
  setupApplication,
  teardownApplication,
  TestingApplication,
  setupRestAppAndClient,
  RestApplicationPort,
  setupEnvs,
  teardownRestAppAndClient,
  teardownEnvs,
} from '../helpers/test-helper';
import {
  ExpectedData,
  MockKeyStoneController,
} from '../fixtures/controllers/mocks/mock.openstack.controller';

const prefix = '/adcaas/v1';

describe('PingController', () => {
  let wafapp: WafApplication;
  let as3Service: AS3Service;
  let client: Client;
  let mockKeystoneApp: TestingApplication;

  before('setupApplication', async () => {
    ({wafapp, client} = await setupApplication());

    // Because PingController has an request injection, we are not
    // able to get as3Service object from PingController, before
    // issuing HTTP request. So we get as3Service object from
    // ApplicationController.
    let controller = await wafapp.get<ApplicationController>(
      'controllers.ApplicationController',
    );
    as3Service = controller.as3Service;

    mockKeystoneApp = await (async () => {
      let {restApp} = await setupRestAppAndClient(
        RestApplicationPort.IdentityAdmin,
        MockKeyStoneController,
      );
      return restApp;
    })();
    setupEnvs();
  });

  after(async () => {
    await teardownApplication(wafapp);
    teardownRestAppAndClient(mockKeystoneApp);
    teardownEnvs();
  });

  it('invokes GET ' + prefix + '/ping', async () => {
    let s = sinon
      .stub(as3Service, 'info')
      .returns(Promise.resolve('Hello from AS3'));

    const res = await client
      .get(prefix + '/ping')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(res.body).to.containEql({
      greeting: 'Hello from F5 ADCaaS for OpenStack',
      as3: 'Hello from AS3',
    });

    s.restore();
  });

  it('invokes GET ' + prefix + '/ping with AS3 error', async () => {
    let s = sinon.stub(as3Service, 'info').throws(new Error('something wrong'));

    const res = await client
      .get(prefix + '/ping')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(res.body).to.containEql({
      greeting: 'Hello from F5 ADCaaS for OpenStack',
      as3: 'something wrong',
    });

    s.restore();
  });
});
