import {Client, expect, sinon} from '@loopback/testlab';
import {WafApplication} from '../..';
import {ApplicationController} from '../../src/controllers';
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
  givenApplicationData,
  givenDeclarationData,
  givenServiceData,
  givenPoolData,
  givenMemberData,
  givenMonitorData,
  givenRuleData,
  givenConditionData,
  givenActionData,
  givenWafpolicyData,
  givenEndpointpolicyData,
  givePoolMonitorAssociationData,
  giveMemberMonitorAssociationData,
  givenServiceEndpointpolicyAssociationData,
} from '../helpers/database.helpers';
import {
  ShouldResponseWith,
  MockKeyStoneController,
  ExpectedData,
} from '../fixtures/controllers/mocks/mock.openstack.controller';

describe('ApplicationController declaration test', () => {
  let wafapp: WafApplication;
  let controller: ApplicationController;
  let client: Client;
  let deployStub: sinon.SinonStub;
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

  before('setupApplication', async () => {
    mockKeystoneApp = await (async () => {
      let {restApp} = await setupRestAppAndClient(
        RestApplicationPort.IdentityAdmin,
        MockKeyStoneController,
      );
      return restApp;
    })();

    ({wafapp, client} = await setupApplication());

    controller = await wafapp.get<ApplicationController>(
      'controllers.ApplicationController',
    );

    ShouldResponseWith({});
    setupEnvs();
  });

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
    deployStub = sinon.stub(controller.as3Service, 'deploy');
  });

  after(async () => {
    await teardownApplication(wafapp);
    teardownRestAppAndClient(mockKeystoneApp);
    teardownEnvs();
  });

  afterEach(async () => {
    deployStub.restore();
  });

  it(
    'post ' +
      prefix +
      '/applications/{applicationId}/declarations: create declaration',
    async () => {
      const application = await givenApplicationData(wafapp);

      let pool = await givenPoolData(wafapp, {
        name: 'pool1',
      });

      let service = await givenServiceData(wafapp, application.id, {
        defaultPoolId: pool.id,
      });

      let member = await givenMemberData(wafapp, {
        poolId: pool.id,
      });

      let monitor = await givenMonitorData(wafapp);

      await givePoolMonitorAssociationData(wafapp, {
        poolId: pool.id,
        monitorId: monitor.id,
      });

      giveMemberMonitorAssociationData(wafapp, {
        memberId: member.id,
        monitorId: monitor.id,
      });

      let epp = await givenEndpointpolicyData(wafapp, {
        name: 'epp1',
      });

      await givenServiceEndpointpolicyAssociationData(wafapp, {
        serviceId: service.id,
        endpointpolicyId: epp.id,
      });

      let rule1 = await givenRuleData(wafapp, {
        name: 'rule1',
        endpointpolicyId: epp.id,
      });

      let rule2 = await givenRuleData(wafapp, {
        name: 'rule2',
        endpointpolicyId: epp.id,
      });

      await givenConditionData(wafapp, {
        ruleId: rule1.id,
        type: 'httpUri',
        path: {operand: 'contains', values: ['/test1/']},
      });

      await givenConditionData(wafapp, {
        ruleId: rule1.id,
        type: 'httpUri',
      });

      await givenConditionData(wafapp, {
        ruleId: rule1.id,
        type: 'test',
      });

      let wafpolicy = await givenWafpolicyData(wafapp);

      await givenActionData(wafapp, {
        ruleId: rule2.id,
        type: 'waf',
        policy: wafpolicy.id,
      });

      await client
        .post(prefix + '/applications/' + application.id + '/declarations')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send({name: 'a-declaration'})
        .expect(200);
    },
  );

  it(
    'post ' +
      prefix +
      '/applications/{applicationId}/declarations: create declaration and policy has no rule',
    async () => {
      const application = await givenApplicationData(wafapp);

      let pool = await givenPoolData(wafapp, {
        name: 'pool1',
      });

      let service = await givenServiceData(wafapp, application.id, {
        defaultPoolId: pool.id,
      });

      await givenMemberData(wafapp, {
        poolId: pool.id,
      });

      let epp = await givenEndpointpolicyData(wafapp, {
        name: 'epp1',
      });

      await givenServiceEndpointpolicyAssociationData(wafapp, {
        serviceId: service.id,
        endpointpolicyId: epp.id,
      });

      await client
        .post(prefix + '/applications/' + application.id + '/declarations')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send({name: 'a-declaration'})
        .expect(422);
    },
  );

  it(
    'post ' +
      prefix +
      '/applications/{applicationId}/declarations: create declaration with non-existing application: ',
    async () => {
      await client
        .post(prefix + '/applications/do-not-exist/declarations')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send({name: 'a-declaration'})
        .expect(404);
    },
  );

  it(
    'get ' +
      prefix +
      '/applications/{applicationId}/declarations: get all declarations',
    async () => {
      const application = await givenApplicationData(wafapp, {
        tenantId: ExpectedData.tenantId,
      });
      const declaration = await givenDeclarationData(wafapp, {
        applicationId: application.id,
        tenantId: ExpectedData.tenantId,
      });

      let response = await client
        .get(prefix + '/applications/' + application.id + '/declarations')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      expect(response.body.declarations[0].id).to.equal(declaration.id);
    },
  );

  it(
    'get ' +
      prefix +
      '/applications/{applicationId}/declarations: get no declarations',
    async () => {
      const application = await givenApplicationData(wafapp);

      let response = await client
        .get(prefix + '/applications/' + application.id + '/declarations')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      expect(response.body.declarations.length).to.equal(0);
    },
  );

  it(
    'get ' +
      prefix +
      '/applications/{applicationId}/declarations/{declarationId}: get declaration',
    async () => {
      const application = await givenApplicationData(wafapp, {
        tenantId: ExpectedData.tenantId,
      });
      const declaration = await givenDeclarationData(wafapp, {
        applicationId: application.id,
        tenantId: ExpectedData.tenantId,
      });

      let response = await client
        .get(
          prefix +
            '/applications/' +
            application.id +
            '/declarations/' +
            declaration.id,
        )
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      expect(response.body.declaration.id).to.equal(declaration.id);
    },
  );

  it(
    'get ' +
      prefix +
      '/applications/{applicationId}/declarations/{declarationId}: get no declaration',
    async () => {
      const application = await givenApplicationData(wafapp);

      await client
        .get(
          prefix +
            '/applications/' +
            application.id +
            '/declarations/do-not-exist',
        )
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(404);
    },
  );

  it(
    'patch' +
      prefix +
      '/applications/{applicationId}/declarations/{declarationId}: update declaration',
    async () => {
      const application = await givenApplicationData(wafapp, {
        tenantId: ExpectedData.tenantId,
      });
      const declaration = await givenDeclarationData(wafapp, {
        applicationId: application.id,
        tenantId: ExpectedData.tenantId,
      });

      await client
        .patch(
          prefix +
            '/applications/' +
            application.id +
            '/declarations/' +
            declaration.id,
        )
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send({name: 'new-name'})
        .expect(204);

      let response = await client
        .get(
          prefix +
            '/applications/' +
            application.id +
            '/declarations/' +
            declaration.id,
        )
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      expect(response.body.declaration.name).to.equal('new-name');
    },
  );

  it(
    'patch' +
      prefix +
      '/applications/{applicationId}/declarations/{declarationId}: update non-existing declaration',
    async () => {
      const application = await givenApplicationData(wafapp);

      await client
        .patch(
          prefix +
            '/applications/' +
            application.id +
            '/declarations/do-not-exist',
        )
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send({name: 'new-name'})
        .expect(404);
    },
  );

  it(
    'delete' +
      prefix +
      '/applications/{applicationId}/declarations/{declarationId}: delete declaration',
    async () => {
      const application = await givenApplicationData(wafapp);
      const declaration = await givenDeclarationData(wafapp, {
        applicationId: application.id,
      });

      await client
        .del(
          prefix +
            '/applications/' +
            application.id +
            '/declarations/' +
            declaration.id,
        )
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(204);
    },
  );

  it(
    'delete' +
      prefix +
      '/applications/{applicationId}/declarations/{declarationId}: delete non-existing declaration',
    async () => {
      const application = await givenApplicationData(wafapp);

      await client
        .del(
          prefix +
            '/applications/' +
            application.id +
            '/declarations/do-not-exist',
        )
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(204);
    },
  );

  it(
    'delete' +
      prefix +
      '/applications/{applicationId}/declarations/{declarationId}: delete declaration with non-existing application',
    async () => {
      await client
        .del(prefix + '/applications/do-not-exist/declarations/do-not-exist')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(204);
    },
  );
});
