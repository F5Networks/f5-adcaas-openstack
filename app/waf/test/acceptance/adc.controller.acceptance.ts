// Copyright F5 Networks, Inc. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect, sinon, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {AdcController} from '../../src/controllers';
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
  givenAdcData,
  createAdcObject,
  givenAdcTenantAssociationData,
} from '../helpers/database.helpers';
import uuid = require('uuid');
import {
  MockKeyStoneController,
  MockNovaController,
  MockNeutronController,
  ExpectedData,
  ShouldResponseWith,
} from '../fixtures/controllers/mocks/mock.openstack.controller';
import {
  MockBigipController,
  BigipShouldResponseWith,
} from '../fixtures/controllers/mocks/mock.bigip.controller';
import {
  MockDOController,
  DOShouldResponseWith,
} from '../fixtures/controllers/mocks/mock.do.controller';
import {checkAndWait} from '../../src/utils';

describe('AdcController', () => {
  let wafapp: WafApplication;
  let client: Client;
  let controller: AdcController;
  let trustStub: sinon.SinonStub;
  let queryStub: sinon.SinonStub;
  let untrustStub: sinon.SinonStub;

  let mockKeystoneApp: TestingApplication;
  let mockNovaApp: TestingApplication;
  let mockNeutronApp: TestingApplication;
  let mockBigip: TestingApplication;
  let mockDO: TestingApplication;

  const prefix = '/adcaas/v1';

  let envs: {[key: string]: string} = {
    OS_AUTH_URL: 'http://localhost:35357/v2.0',
    OS_USERNAME: 'wafaas',
    OS_PASSWORD: '91153c85b8dd4147',
    OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
    OS_DOMAIN_NAME: 'Default',
    OS_REGION_NAME: 'RegionOne',
    OS_AVAILABLE_ZONE: 'nova',
    DO_ENDPOINT: 'http://localhost:' + RestApplicationPort.Onboarding,
    DO_BIGIQ_HOST: '10.250.15.105',
    DO_BIGIQ_USERNAME: 'admin',
    DO_BIGIQ_PASSWORD: 'admin',
    DO_BIGIQ_POOL: 'mykeypool',
  };

  before('setupApplication', async () => {
    mockKeystoneApp = await (async () => {
      let {restApp} = await setupRestAppAndClient(
        RestApplicationPort.IdentityAdmin,
        MockKeyStoneController,
      );
      return restApp;
    })();

    mockNovaApp = await (async () => {
      let {restApp} = await setupRestAppAndClient(
        RestApplicationPort.Nova,
        MockNovaController,
      );
      return restApp;
    })();

    mockNeutronApp = await (async () => {
      let {restApp} = await setupRestAppAndClient(
        RestApplicationPort.Neutron,
        MockNeutronController,
      );
      return restApp;
    })();

    mockBigip = await (async () => {
      let {restApp} = await setupRestAppAndClient(
        RestApplicationPort.SSLDefault,
        MockBigipController,
        'https',
      );
      return restApp;
    })();

    mockDO = await (async () => {
      let {restApp} = await setupRestAppAndClient(
        RestApplicationPort.Onboarding,
        MockDOController,
      );
      return restApp;
    })();

    ({wafapp, client} = await setupApplication());

    controller = await wafapp.get<AdcController>('controllers.AdcController');

    ShouldResponseWith({});
    setupEnvs();
  });

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
    trustStub = sinon.stub(controller.trustedDeviceService, 'trust');
    queryStub = sinon.stub(controller.trustedDeviceService, 'query');
    untrustStub = sinon.stub(controller.trustedDeviceService, 'untrust');
  });

  afterEach(async () => {
    trustStub.restore();
    queryStub.restore();
    untrustStub.restore();
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
    teardownRestAppAndClient(mockDO);
    teardownRestAppAndClient(mockBigip);
    teardownRestAppAndClient(mockKeystoneApp);
    teardownRestAppAndClient(mockNovaApp);
    teardownRestAppAndClient(mockNeutronApp);
    teardownEnvs();
  });

  it('post ' + prefix + '/adcs: create ADC HW', async () => {
    await givenAdcData(wafapp, {
      trustedDeviceId: 'abcdefg',
    });

    const adc = createAdcObject({
      type: 'HW',
      management: {
        ipAddress: '1.2.3.4',
        tcpPort: 100,
        username: 'admin',
        password: 'admin',
        rootPass: 'default',
      },
    });

    let id = uuid();
    trustStub.returns({
      devices: [
        {
          targetUUID: id,
          targetHost: '1.2.3.4',
          state: 'CREATED',
        },
      ],
    });

    queryStub.returns({
      devices: [
        {
          targetUUID: id,
          targetHost: '1.2.3.4',
          state: 'ACTIVE',
        },
      ],
    });

    const response = await client
      .post(prefix + '/adcs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(adc)
      .expect(200);

    expect(response.body.adc).to.containDeep(toJSON(adc));
  });

  it(
    'post ' + prefix + '/adcs: create ADC HW without management info',
    async () => {
      const adc = createAdcObject({type: 'HW'});
      delete adc.management;

      await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(400);
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC HW with trust exception',
    async () => {
      const adc = createAdcObject({type: 'HW'});

      trustStub.throws({
        message: 'Unknown error',
      });

      await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC HW with wrong trust response',
    async () => {
      const adc = createAdcObject({type: 'HW'});

      trustStub.returns({
        devices: [{}, {}],
      });

      await client
        .post(prefix + '/adcs')
        .send(adc)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(422);
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC HW with error trust response',
    async () => {
      const adc = createAdcObject({
        type: 'HW',
        management: {
          ipAddress: '1.2.3.4',
          tcpPort: 100,
          username: 'admin',
          password: 'admin',
          rootPass: 'default',
        },
      });

      trustStub.returns({
        devices: [
          {
            targetUUID: uuid(),
            targetHost: '1.2.3.4',
            state: 'ERROR',
          },
        ],
      });

      await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC HW with trust query exception',
    async () => {
      const adc = createAdcObject({
        type: 'HW',
        management: {
          ipAddress: '1.2.3.4',
          tcpPort: 100,
          username: 'admin',
          password: 'admin',
          rootPass: 'default',
        },
      });

      let id = uuid();
      trustStub.returns({
        devices: [
          {
            targetUUID: id,
            targetHost: '1.2.3.4',
            state: 'PENDING',
          },
        ],
      });

      queryStub.throws('Not working');

      await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);
    },
  );

  it('post ' + prefix + '/adcs: create ADC HW with trust timeout', async () => {
    //TODO: timeout UT
  });

  it('get ' + prefix + '/adcs: of all', async () => {
    const adc = await givenAdcData(wafapp, {
      tenantId: ExpectedData.tenantId,
    });

    let response = await client
      .get(prefix + '/adcs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.adcs).to.containDeep([toJSON(adc)]);
  });

  it('get ' + prefix + '/adcs: with filter string', async () => {
    const adc = await givenAdcData(wafapp, {
      tenantId: ExpectedData.tenantId,
    });

    let response = await client
      .get(prefix + '/adcs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({filter: {where: {id: adc.id}}})
      .expect(200);

    expect(response.body.adcs).to.containDeep([toJSON(adc)]);
  });

  it('get ' + prefix + '/adcs/count', async () => {
    let response = await client
      .get(prefix + '/adcs/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(response.body.count).to.eql(0);

    const adc = await givenAdcData(wafapp);

    response = await client
      .get(prefix + '/adcs/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({where: {id: adc.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/adcs/{id}: selected item', async () => {
    await givenAdcData(wafapp);
    const adc = await givenAdcData(wafapp);

    let response = await client
      .get(prefix + '/adcs/' + adc.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(response.body.adc).to.containDeep(toJSON(adc));
  });

  it('get ' + prefix + '/adcs/{id}: not found', async () => {
    await client
      .get(prefix + '/adcs/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });

  it('patch ' + prefix + '/adcs/{id}: existing item', async () => {
    const patched_name = {name: 'new adc name'};
    const adc = await givenAdcData(wafapp);

    await client
      .patch(prefix + '/adcs/' + adc.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/adcs/{id}: non-existing item', async () => {
    const patched_name = {name: 'new adc name'};
    await client
      .patch(prefix + '/adcs/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(patched_name)
      .expect(404);
  });

  it('delete ' + prefix + '/adcs/{id}: non-existing item', async () => {
    await client
      .del(prefix + '/adcs/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });

  it('delete ' + prefix + '/adcs/{id}: existing item', async () => {
    const adc = await givenAdcData(wafapp);

    await client
      .del(prefix + '/adcs/' + adc.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(204);
  });

  it('delete ' + prefix + '/adcs/{id}: trusted device', async () => {
    let id = uuid();
    const adc = await givenAdcData(wafapp, {
      trustedDeviceId: id,
    });

    untrustStub.returns({
      devices: [
        {
          state: 'DELETING',
        },
      ],
    });

    await client
      .del(prefix + '/adcs/' + adc.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(204);
  });

  it('delete ' + prefix + '/adcs/{id}: untrust exception', async () => {
    let id = uuid();
    const adc = await givenAdcData(wafapp, {
      trustedDeviceId: id,
    });

    untrustStub.throws('Not working');

    await client
      .del(prefix + '/adcs/' + adc.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(422);
  });

  it('delete ' + prefix + '/adcs/{id}: empty untrust response', async () => {
    let id = uuid();
    const adc = await givenAdcData(wafapp, {
      trustedDeviceId: id,
    });

    untrustStub.returns({
      devices: [],
    });

    await client
      .del(prefix + '/adcs/' + adc.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(422);
  });

  it('delete ' + prefix + '/adcs/{id}: wrong untrust state', async () => {
    let id = uuid();
    const adc = await givenAdcData(wafapp, {
      trustedDeviceId: id,
    });

    untrustStub.returns({
      devices: [
        {
          state: 'ERROR',
        },
      ],
    });

    await client
      .del(prefix + '/adcs/' + adc.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(422);
  });

  it(
    'get ' + prefix + '/adcs/{adcId}/adcs: find Tenants associated with ADC',
    async () => {
      let adc = await givenAdcData(wafapp);
      let assoc = await givenAdcTenantAssociationData(wafapp, {
        adcId: adc.id,
        tenantId: '12345678',
      });

      let response = await client
        .get(prefix + '/adcs/' + adc.id + '/tenants')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      expect(response.body.tenants[0].id).to.equal(assoc.tenantId);
    },
  );

  it(
    'get ' +
      prefix +
      '/adcs/{adcId}/adcs: Cannot find any Tenant associated with ADC',
    async () => {
      let adc = await givenAdcData(wafapp);

      let response = await client
        .get(prefix + '/adcs/' + adc.id + '/tenants')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      expect(response.body.tenants.length).to.equal(0);
    },
  );

  it(
    'get ' +
      prefix +
      '/adcs/{adcId}/tenants/{tenantId}: find Tenant associated with ADC',
    async () => {
      let adc = await givenAdcData(wafapp);
      let assoc = await givenAdcTenantAssociationData(wafapp, {
        adcId: adc.id,
        tenantId: '12345678',
      });

      let response = await client
        .get(prefix + '/adcs/' + adc.id + '/tenants/' + assoc.tenantId)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      expect(response.body.tenant.id).to.equal(assoc.tenantId);
    },
  );

  it(
    'get ' +
      prefix +
      '/adcs/{adcId}/tenants/{tenantId}: cannot find Tenant association ith ADC',
    async () => {
      let adc = await givenAdcData(wafapp);

      await client
        .get(prefix + '/adcs/' + adc.id + '/tenants/' + '12345678')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(404);
    },
  );

  it('post ' + prefix + '/adcs/{adcId}/action: create done', async () => {
    let adc = await givenAdcData(wafapp);

    await setupEnvs()
      .then(async () => {
        let response = await client
          .post(prefix + '/adcs/' + adc.id + '/action')
          .set('X-Auth-Token', ExpectedData.userToken)
          .send({create: null})
          .expect(200);

        expect(response.body).containDeep({id: adc.id});

        let checkStatus = async () => {
          let resp = await client
            .get(prefix + '/adcs/' + adc.id)
            .set('X-Auth-Token', ExpectedData.userToken)
            .expect(200);

          return resp.body.adc.status === 'POWERON';
        };

        await checkAndWait(checkStatus, 5, [], 50).then(() => {
          expect(true).true();
        });
      })
      .finally(teardownEnvs);
  });

  it('post ' + prefix + '/adcs/{adcId}/action: setup done', async () => {
    BigipShouldResponseWith({});
    DOShouldResponseWith({});
    let adc = await givenAdcData(wafapp);
    ExpectedData.bigipMgmt.hostname = adc.id + '.f5bigip.local';

    await setupEnvs()
      .then(async () => {
        let response = await client
          .post(prefix + '/adcs/' + adc.id + '/action')
          .set('X-Auth-Token', ExpectedData.userToken)
          .send({setup: null})
          .expect(200);

        expect(response.body).containDeep({id: adc.id});

        let checkStatus = async () => {
          let resp = await client
            .get(prefix + '/adcs/' + adc.id)
            .set('X-Auth-Token', ExpectedData.userToken)
            .expect(200);

          return resp.body.adc.status === 'ONBOARDED';
        };

        await checkAndWait(checkStatus, 5, [], 50).then(() => {
          expect(true).true();
        });
      })
      .finally(teardownEnvs);
  });

  // TODO: the timeout can only be tested through unit test?
  //  The following test case leads all tests fail.
  // it(
  //   'post ' + prefix + '/adcs/{adcId}/action: setup: bigip not accessible',
  //   async () => {
  //     BigipShouldResponseWith({
  //       '/mgmt/tm/sys': StubResponses.bigipMgmtSysTimeout,
  //     });

  //     let adc = await givenAdcData(wafapp);

  //     await setupEnvs()
  //       .then(async () => {
  //         let response = await client
  //           .post(prefix + '/adcs/' + adc.id + '/action')
  //           .set('X-Auth-Token', ExpectedData.userToken)
  //           .send({setup: null})
  //           .expect(408);
  //       })
  //       .finally(teardownEnvs);
  //   },
  // );
});
