/**
 * Copyright 2019 F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  setupEnvs,
  teardownEnvs,
  teardownDepApps,
  setupDepApps,
} from '../helpers/testsetup-helper';
import {stubConsoleLog, restoreConsoleLog} from '../helpers/logging.helpers';
import {
  givenEmptyDatabase,
  givenAdcData,
  givenAdcTenantAssociationData,
  createAdcObject,
} from '../helpers/database.helpers';
import uuid = require('uuid');
import {checkAndWait, setDefaultInterval, sleep} from '../../src/utils';
import {BigipBuiltInProperties} from '../../src/services';
import {
  StubResponses,
  RestApplicationPort,
  LetResponseWith,
  ExpectedData,
} from '../fixtures/datasources/testrest.datasource';

describe('AdcController test', () => {
  let wafapp: WafApplication;
  let client: Client;
  let controller: AdcController;
  let trustStub: sinon.SinonStub;
  let queryStub: sinon.SinonStub;
  let untrustStub: sinon.SinonStub;
  let installStub: sinon.SinonStub;
  let queryExtensionsStub: sinon.SinonStub;

  const prefix = '/adcaas/v1';

  before('setupApplication', async () => {
    await setupDepApps();
    ({wafapp, client} = await setupApplication());

    controller = await wafapp.get<AdcController>('controllers.AdcController');

    BigipBuiltInProperties.port = RestApplicationPort.SSLCustom;
    setDefaultInterval(1);
    setupEnvs();

    let fs = require('fs');
    fs.writeFileSync(process.env.DO_RPM_PACKAGE!, 'abcd', {
      recursive: true,
    });
  });

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
    trustStub = sinon.stub(controller.asgService, 'trust');
    queryStub = sinon.stub(controller.asgService, 'queryTrust');
    untrustStub = sinon.stub(controller.asgService, 'untrust');
    installStub = sinon.stub(controller.asgService, 'install');
    queryExtensionsStub = sinon.stub(controller.asgService, 'queryExtensions');

    LetResponseWith();
  });

  afterEach(async () => {
    trustStub.restore();
    queryStub.restore();
    untrustStub.restore();
    installStub.restore();
    queryExtensionsStub.restore();
  });

  after(async () => {
    let fs = require('fs');
    fs.unlinkSync(process.env.DO_RPM_PACKAGE!);
    await teardownApplication(wafapp);
    await teardownDepApps();
    await teardownEnvs();
  });

  it('post ' + prefix + '/adcs: create ADC HW', async function() {
    await givenAdcData(wafapp, {
      management: {trustedDeviceId: 'abcdefg'},
    });

    const adc = createAdcObject({
      type: 'HW',
      management: {
        connection: {
          ipAddress: ExpectedData.networks.management.ipAddr,
          tcpPort: ExpectedData.bigipMgmt.tcpPort,
          username: 'admin',
          password: 'admin',
          rootPass: 'default',
        },
      },
    });

    let id = uuid();
    trustStub.returns({
      devices: [
        {
          targetUUID: id,
          targetHost: ExpectedData.networks.management.ipAddr,
          state: 'CREATED',
        },
      ],
    });

    queryStub.onCall(0).returns({
      devices: [
        {
          targetUUID: id,
          targetHost: ExpectedData.networks.management.ipAddr,
          state: 'PENDING',
        },
      ],
    });

    queryStub.returns({
      devices: [
        {
          targetUUID: id,
          targetHost: ExpectedData.networks.management.ipAddr,
          state: 'ACTIVE',
        },
      ],
    });

    queryExtensionsStub.onCall(0).returns([]);

    queryExtensionsStub.onCall(1).returns([
      {
        rpmFile: 'f5-appsvcs-3.10.0-5.noarch.rpm',
        state: 'UPLOADING',
      },
    ]);

    queryExtensionsStub.onCall(2).returns([
      {
        rpmFile: 'f5-appsvcs-3.10.0-5.noarch.rpm',
        name: 'f5-appsvcs',
        state: 'AVAILABLE',
      },
    ]);

    let response = await client
      .post(prefix + '/adcs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(adc)
      .expect(200);

    expect(response.body.adc).to.containDeep(toJSON(adc));

    await sleep(50);

    response = await client
      .get(prefix + '/adcs/' + response.body.adc.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(response.body.adc.status).to.equal('INSTALLED');
    expect(response.body.adc.management.trustedDeviceId).to.equal(id);
  });

  it('post ' + prefix + '/adcs: create ADC with sshKey', async function() {
    const adc = createAdcObject({
      type: 'VE',
      management: {
        connection: {
          ipAddress: ExpectedData.networks.management.ipAddr,
          tcpPort: ExpectedData.bigipMgmt.tcpPort,
          username: 'admin',
          password: 'admin',
          rootPass: 'default',
        },
        networks: {},
        compute: {
          sshKey:
            'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCbm1UDaANxk2v7IU8X5pQQiHWt+zFL66qiwVNOwTcpZgOb5fUiKxckkSq2DmPsI9QQG19FTV8w//iZcu/P+H2rFzJUKPYaFKYt/wqBV6iyp06NYWR7hobyxSGo/bxXd/Q40FyZwKeYAezBAgKAceTHb1YGBPyySe7CRBU2olTqlWyfrcheA1BKh4CpMp1kmeuDcTnAwi5bCZXX3esopAzWRuHhOeaViWPe1BzqcJD+uN4TOdR63QpVYr4JYFTMN7XQ8UK9QYhLxy1Llk7rT1DT2MdEhHYtVfPnjtj0T5ehWjm7pug8E2GaS/cAWUwSOWnGkEI/zuuwevAA8/JPJIGf j@BEI-ML-00',
        },
      },
    });

    let response = await client
      .post(prefix + '/adcs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(adc)
      .expect(200);

    expect(response.body.adc).to.containDeep(toJSON(adc));
  });

  it('post ' + prefix + '/adcs: create ADC without sshKey', async function() {
    const adc = createAdcObject({
      type: 'VE',
      management: {
        connection: {
          ipAddress: ExpectedData.networks.management.ipAddr,
          tcpPort: ExpectedData.bigipMgmt.tcpPort,
          username: 'admin',
          password: 'admin',
          rootPass: 'default',
        },
        networks: {},
        compute: {},
      },
    });

    let response = await client
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
      // @ts-ignore adc have management property.
      delete adc.management.connection;

      await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(400);
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC with invalid type value',
    async function() {
      const adc = createAdcObject({
        name: 'ADC1',
        type: 'whatever',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {},
          compute: {},
        },
      });

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
      expect(response.body.error.details[0].code).to.equal('enum');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC with invalid property in compute',
    async function() {
      const adc = {
        name: 'ADC2',
        type: 'VE',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {},
          compute: {
            imageRef: '0c571ff7-00ff-4e27-9f78-37e8dd31ef6d',
            flavorRef23: '201906',
            sshKey: 'abc',
          },
        },
      };

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC with imageRef not being a uuid',
    async function() {
      const adc = {
        name: 'ADC2',
        type: 'VE',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {},
          compute: {
            imageRef: '123456',
            flavorRef: '201906',
            sshKey: 'abc',
          },
        },
      };

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC with flavorRef not being string',
    async function() {
      const adc = {
        name: 'ADC2',
        type: 'VE',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {},
          compute: {
            imageRef: '0c571ff7-00ff-4e27-9f78-37e8dd31ef6d',
            flavorRef: 201906,
            sshKey: 'abc',
          },
        },
      };

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC with sshKey not being string',
    async function() {
      const adc = {
        name: 'ADC2',
        type: 'VE',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {},
          compute: {
            imageRef: '0c571ff7-00ff-4e27-9f78-37e8dd31ef6d',
            flavorRef: '201906',
            sshKey: 123,
          },
        },
      };

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC with userData not being string',
    async function() {
      const adc = {
        name: 'ADC2',
        type: 'VE',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {},
          compute: {
            imageRef: '0c571ff7-00ff-4e27-9f78-37e8dd31ef6d',
            flavorRef: '201906',
            sshKey: '123',
            userData: 123,
          },
        },
      };

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC with property not being mgmt1',
    async function() {
      const adc = {
        name: 'ADC2',
        type: 'VE',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {
            mgmt1Not: {
              type: 'mgmt',
              networkId: ExpectedData.networks.management.networkId,
              fixedIp: ExpectedData.networks.management.ipAddr,
            },
            failover1: {
              type: 'ha',
              networkId: ExpectedData.networks.ha.networkId,
              fixedIp: ExpectedData.networks.ha.ipAddr,
            },
            internal1: {
              type: 'int',
              networkId: ExpectedData.networks.internal.networkId,
              fixedIp: ExpectedData.networks.internal.ipAddr,
            },
            external2: {
              type: 'ext',
              networkId: ExpectedData.networks.external.networkId,
              fixedIp: ExpectedData.networks.external.ipAddr,
              floatingIp: '10.250.14.160',
            },
          },
          compute: {
            imageRef: '0c571ff7-00ff-4e27-9f78-37e8dd31ef6d',
            flavorRef: '201906',
            sshKey: '123',
          },
        },
      };

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC with more than 4 properties',
    async function() {
      const adc = {
        name: 'ADC2',
        type: 'VE',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {
            mgmt1: {
              type: 'mgmt',
              networkId: ExpectedData.networks.management.networkId,
              fixedIp: ExpectedData.networks.management.ipAddr,
            },
            failover1: {
              type: 'ha',
              networkId: ExpectedData.networks.ha.networkId,
              fixedIp: ExpectedData.networks.ha.ipAddr,
            },
            internal1: {
              type: 'int',
              networkId: ExpectedData.networks.internal.networkId,
              fixedIp: ExpectedData.networks.internal.ipAddr,
            },
            external2: {
              type: 'ext',
              networkId: ExpectedData.networks.external.networkId,
              fixedIp: ExpectedData.networks.external.ipAddr,
              floatingIp: '10.250.14.160',
            },
            whatever: {
              type: 'whatever',
              networkId: ExpectedData.networks.internal.networkId,
              fixedIp: ExpectedData.networks.internal.ipAddr,
            },
          },
          compute: {
            imageRef: '0c571ff7-00ff-4e27-9f78-37e8dd31ef6d',
            flavorRef: '201906',
            sshKey: '123',
          },
        },
      };

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC with less than 4 properties',
    async function() {
      const adc = {
        name: 'ADC2',
        type: 'VE',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {
            mgmt1: {
              type: 'mgmt',
              networkId: ExpectedData.networks.management.networkId,
              fixedIp: ExpectedData.networks.management.ipAddr,
            },
            failover1: {
              type: 'ha',
              networkId: ExpectedData.networks.ha.networkId,
              fixedIp: ExpectedData.networks.ha.ipAddr,
            },
            internal1: {
              type: 'int',
              networkId: ExpectedData.networks.internal.networkId,
              fixedIp: ExpectedData.networks.internal.ipAddr,
            },
          },
          compute: {
            imageRef: '0c571ff7-00ff-4e27-9f78-37e8dd31ef6d',
            flavorRef: '201906',
            sshKey: '123',
          },
        },
      };

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC with type of internal1 not int',
    async function() {
      const adc = {
        name: 'ADC2',
        type: 'VE',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {
            mgmt1: {
              type: 'mgmt',
              networkId: ExpectedData.networks.management.networkId,
              fixedIp: ExpectedData.networks.management.ipAddr,
            },
            failover1: {
              type: 'ha',
              networkId: ExpectedData.networks.ha.networkId,
              fixedIp: ExpectedData.networks.ha.ipAddr,
            },
            internal1: {
              type: 'whatever',
              networkId: ExpectedData.networks.internal.networkId,
              fixedIp: ExpectedData.networks.internal.ipAddr,
            },
            external2: {
              type: 'ext',
              networkId: ExpectedData.networks.external.networkId,
              fixedIp: ExpectedData.networks.external.ipAddr,
              floatingIp: '10.250.14.160',
            },
          },
          compute: {
            imageRef: '0c571ff7-00ff-4e27-9f78-37e8dd31ef6d',
            flavorRef: '201906',
            sshKey: '123',
          },
        },
      };

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC with networkId of external2 not uuid',
    async function() {
      const adc = {
        name: 'ADC2',
        type: 'VE',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {
            mgmt1: {
              type: 'mgmt',
              networkId: ExpectedData.networks.management.networkId,
              fixedIp: ExpectedData.networks.management.ipAddr,
            },
            failover1: {
              type: 'ha',
              networkId: ExpectedData.networks.ha.networkId,
              fixedIp: ExpectedData.networks.ha.ipAddr,
            },
            internal1: {
              type: 'int',
              networkId: ExpectedData.networks.internal.networkId,
              fixedIp: ExpectedData.networks.internal.ipAddr,
            },
            external2: {
              type: 'ext',
              networkId: 123,
              fixedIp: ExpectedData.networks.external.ipAddr,
              floatingIp: '10.250.14.160',
            },
          },
          compute: {
            imageRef: '0c571ff7-00ff-4e27-9f78-37e8dd31ef6d',
            flavorRef: '201906',
            sshKey: '123',
          },
        },
      };

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC with invalid property in mgmt1',
    async function() {
      const adc = {
        name: 'ADC2',
        type: 'VE',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {
            mgmt1: {
              type: 'mgmt',
              networkId: ExpectedData.networks.management.networkId,
              fixedIp: ExpectedData.networks.management.ipAddr,
              whatever: 'whatever',
            },
            failover1: {
              type: 'ha',
              networkId: ExpectedData.networks.ha.networkId,
              fixedIp: ExpectedData.networks.ha.ipAddr,
            },
            internal1: {
              type: 'int',
              networkId: ExpectedData.networks.internal.networkId,
              fixedIp: ExpectedData.networks.internal.ipAddr,
            },
            external2: {
              type: 'ext',
              networkId: ExpectedData.networks.external.networkId,
              fixedIp: ExpectedData.networks.external.ipAddr,
              floatingIp: '10.250.14.160',
            },
          },
          compute: {
            imageRef: '0c571ff7-00ff-4e27-9f78-37e8dd31ef6d',
            flavorRef: '201906',
            sshKey: '123',
          },
        },
      };

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC with fixedIp invalid',
    async function() {
      const adc = {
        name: 'ADC2',
        type: 'VE',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {
            mgmt1: {
              type: 'mgmt',
              networkId: ExpectedData.networks.management.networkId,
              fixedIp: '123',
            },
            failover1: {
              type: 'ha',
              networkId: ExpectedData.networks.ha.networkId,
              fixedIp: ExpectedData.networks.ha.ipAddr,
            },
            internal1: {
              type: 'int',
              networkId: ExpectedData.networks.internal.networkId,
              fixedIp: ExpectedData.networks.internal.ipAddr,
            },
            external2: {
              type: 'ext',
              networkId: ExpectedData.networks.external.networkId,
              fixedIp: ExpectedData.networks.external.ipAddr,
              floatingIp: '10.250.14.160',
            },
          },
          compute: {
            imageRef: '0c571ff7-00ff-4e27-9f78-37e8dd31ef6d',
            flavorRef: '201906',
            sshKey: '123',
          },
        },
      };

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC with floatingIp invalid',
    async function() {
      const adc = {
        name: 'ADC2',
        type: 'VE',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {
            mgmt1: {
              type: 'mgmt',
              networkId: ExpectedData.networks.management.networkId,
              fixedIp: ExpectedData.networks.management.ipAddr,
            },
            failover1: {
              type: 'ha',
              networkId: ExpectedData.networks.ha.networkId,
              fixedIp: ExpectedData.networks.ha.ipAddr,
            },
            internal1: {
              type: 'int',
              networkId: ExpectedData.networks.internal.networkId,
              fixedIp: ExpectedData.networks.internal.ipAddr,
            },
            external2: {
              type: 'ext',
              networkId: ExpectedData.networks.external.networkId,
              fixedIp: ExpectedData.networks.external.ipAddr,
              floatingIp: '123',
            },
          },
          compute: {
            imageRef: '0c571ff7-00ff-4e27-9f78-37e8dd31ef6d',
            flavorRef: '201906',
            sshKey: '123',
          },
        },
      };

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC with invalid property in failover1',
    async function() {
      const adc = {
        name: 'ADC2',
        type: 'VE',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {
            mgmt1: {
              type: 'mgmt',
              networkId: ExpectedData.networks.management.networkId,
              fixedIp: ExpectedData.networks.management.ipAddr,
            },
            failover1: {
              type: 'ha',
              networkId: ExpectedData.networks.ha.networkId,
              fixedIp: ExpectedData.networks.ha.ipAddr,
              whatever: 'whatever',
            },
            internal1: {
              type: 'int',
              networkId: ExpectedData.networks.internal.networkId,
              fixedIp: ExpectedData.networks.internal.ipAddr,
            },
            external2: {
              type: 'ext',
              networkId: ExpectedData.networks.external.networkId,
              fixedIp: ExpectedData.networks.external.ipAddr,
              floatingIp: '10.250.14.160',
            },
          },
          compute: {
            imageRef: '0c571ff7-00ff-4e27-9f78-37e8dd31ef6d',
            flavorRef: '201906',
            sshKey: '123',
          },
        },
      };

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC HW with trust exception',
    async () => {
      const adc = createAdcObject({type: 'HW'});

      trustStub.throws({
        message: 'Unknown error',
      });

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(200);

      response = await client
        .get(prefix + '/adcs/' + response.body.adc.id)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      expect(response.body.adc.status).to.equal('TRUSTERROR');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC HW with wrong trust response',
    async () => {
      const adc = createAdcObject({type: 'HW'});

      trustStub.returns({
        devices: [{}, {}],
      });

      let response = await client
        .post(prefix + '/adcs')
        .send(adc)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      response = await client
        .get(prefix + '/adcs/' + response.body.adc.id)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      expect(response.body.adc.status).to.equal('TRUSTERROR');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC HW with error query response',
    async () => {
      const adc = createAdcObject({
        type: 'HW',
        management: {
          ipAddress: ExpectedData.networks.management.ipAddr,
          tcpPort: ExpectedData.bigipMgmt.tcpPort,
          username: 'admin',
          password: 'admin',
          rootPass: 'default',
        },
      });

      trustStub.returns({
        devices: [
          {
            targetUUID: uuid(),
            targetHost: ExpectedData.networks.management.ipAddr,
            state: 'PENDING',
          },
        ],
      });

      queryStub.returns({
        devices: [
          {
            targetUUID: uuid(),
            targetHost: ExpectedData.networks.management.ipAddr,
            state: 'ERROR',
          },
        ],
      });

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(200);

      let checkFunc = async () => {
        response = await client
          .get(prefix + '/adcs/' + response.body.adc.id)
          .set('X-Auth-Token', ExpectedData.userToken)
          .set('tenant-id', ExpectedData.tenantId)
          .expect(200);

        return response.body.adc.status === 'TRUSTERROR';
      };
      await checkAndWait(checkFunc, 50, [], 5).then(() => {
        expect(true).eql(true);
      });
      expect(response.body.adc.lastErr).eql(
        'TRUSTERROR: Trusted device state is ERROR',
      );
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC HW with trust query exception',
    async () => {
      const adc = createAdcObject({
        type: 'HW',
        management: {
          ipAddress: ExpectedData.networks.management.ipAddr,
          tcpPort: ExpectedData.bigipMgmt.tcpPort,
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
            targetHost: ExpectedData.networks.management.ipAddr,
            state: 'PENDING',
          },
        ],
      });

      queryStub.throws(new Error('Not working'));

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(200);

      let checkFunc = async () => {
        response = await client
          .get(prefix + '/adcs/' + response.body.adc.id)
          .set('X-Auth-Token', ExpectedData.userToken)
          .set('tenant-id', ExpectedData.tenantId)
          .expect(200);

        return response.body.adc.status === 'TRUSTERROR';
      };
      await checkAndWait(checkFunc, 50, [], 5).then(() => {
        expect(true).eql(true);
      });
      expect(response.body.adc.lastErr).eql('TRUSTERROR: Not working');
    },
  );

  it('post ' + prefix + '/adcs: create ADC HW with trust timeout', async () => {
    LetResponseWith({
      asg_get_mgmt_shared_trusteddevices_deviceId:
        StubResponses.trustDeviceStatusPending200,
    });
    await givenAdcData(wafapp, {
      management: {trustedDeviceId: 'abcdefg'},
    });

    const adc = createAdcObject({
      type: 'HW',
      management: {
        connection: {
          ipAddress: ExpectedData.networks.management.ipAddr,
          tcpPort: ExpectedData.bigipMgmt.tcpPort,
          username: 'admin',
          password: 'admin',
          rootPass: 'default',
        },
        networks: {},
      },
    });

    let id = uuid();
    trustStub.returns({
      devices: [
        {
          targetUUID: id,
          targetHost: ExpectedData.networks.management.ipAddr,
          state: 'CREATED',
        },
      ],
    });

    queryStub.returns({
      devices: [
        {
          targetUUID: id,
          targetHost: ExpectedData.networks.management.ipAddr,
          state: 'PENDING',
        },
      ],
    });

    let response = await client
      .post(prefix + '/adcs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(adc)
      .expect(200);

    expect(response.body.adc).to.containDeep(toJSON(adc));

    await sleep(50);

    response = await client
      .get(prefix + '/adcs/' + response.body.adc.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(response.body.adc.status).to.equal('TRUSTERROR');
    expect(response.body.adc.lastErr).to.equal('TRUSTERROR: timeout');
  });

  it(
    'post ' + prefix + '/adcs: create ADC HW whose AS3 exists',
    async function() {
      await givenAdcData(wafapp, {
        management: {trustedDeviceId: 'abcdefg'},
      });

      const adc = createAdcObject({
        type: 'HW',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {},
        },
      });

      let id = uuid();
      trustStub.returns({
        devices: [
          {
            targetUUID: id,
            targetHost: ExpectedData.networks.management.ipAddr,
            state: 'CREATED',
          },
        ],
      });

      queryStub.returns({
        devices: [
          {
            targetUUID: id,
            targetHost: ExpectedData.networks.management.ipAddr,
            state: 'ACTIVE',
          },
        ],
      });

      queryExtensionsStub.returns([
        {
          rpmFile: 'f5-appsvcs-3.10.0-5.noarch.rpm',
          name: 'f5-appsvcs',
          state: 'AVAILABLE',
        },
      ]);

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(200);

      expect(response.body.adc).to.containDeep(toJSON(adc));

      await sleep(150);

      response = await client
        .get(prefix + '/adcs/' + response.body.adc.id)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      expect(response.body.adc.status).to.equal('INSTALLED');
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC HW with wrong AS3 extension response',
    async function() {
      await givenAdcData(wafapp, {
        management: {trustedDeviceId: 'abcdefg'},
      });

      const adc = createAdcObject({
        type: 'HW',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {},
        },
      });

      let id = uuid();
      trustStub.returns({
        devices: [
          {
            targetUUID: id,
            targetHost: ExpectedData.networks.management.ipAddr,
            state: 'CREATED',
          },
        ],
      });

      queryStub.onCall(0).returns({
        devices: [
          {
            targetUUID: id,
            targetHost: ExpectedData.networks.management.ipAddr,
            state: 'PENDING',
          },
        ],
      });

      queryStub.returns({
        devices: [
          {
            targetUUID: id,
            targetHost: ExpectedData.networks.management.ipAddr,
            state: 'ACTIVE',
          },
        ],
      });

      queryExtensionsStub.returns([]);
      LetResponseWith({
        bigip_get_mgmt_shared_appsvcs_info: StubResponses.bigipAS3Info404,
      });

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(200);

      expect(response.body.adc).to.containDeep(toJSON(adc));

      let expectStatus = 'INSTALLERROR';
      let checkFunc = async () => {
        response = await client
          .get(prefix + '/adcs/' + response.body.adc.id)
          .set('X-Auth-Token', ExpectedData.userToken)
          .set('tenant-id', ExpectedData.tenantId)
          .expect(200);
        return response.body.adc.status === expectStatus;
      };

      await checkAndWait(checkFunc, 240, [], 1).then(
        () => {
          expect(response.body.adc.status).eql(expectStatus);
        },
        () => {
          expect(response.body.adc.status).eql(expectStatus);
        },
      );
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC HW with query extension exception',
    async function() {
      await givenAdcData(wafapp, {
        management: {trustedDeviceId: 'abcdefg'},
      });

      const adc = createAdcObject({
        type: 'HW',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,

            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {},
        },
      });

      let id = uuid();
      trustStub.returns({
        devices: [
          {
            targetUUID: id,
            targetHost: ExpectedData.networks.management.ipAddr,
            state: 'CREATED',
          },
        ],
      });

      queryStub.returns({
        devices: [
          {
            targetUUID: id,
            targetHost: ExpectedData.networks.management.ipAddr,
            state: 'ACTIVE',
          },
        ],
      });

      queryExtensionsStub.throws(new Error('query-not-working'));
      LetResponseWith({
        bigip_get_mgmt_shared_appsvcs_info: StubResponses.bigipAS3Info404,
      });

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(200);

      expect(response.body.adc).to.containDeep(toJSON(adc));

      let func = async () => {
        let resp = await client
          .get(prefix + '/adcs/' + response.body.adc.id)
          .set('X-Auth-Token', ExpectedData.userToken)
          .set('tenant-id', ExpectedData.tenantId)
          .expect(200);

        return (
          resp.body.adc.status === 'INSTALLERROR' &&
          resp.body.adc.lastErr === `INSTALLERROR: Fail to install AS3`
        );
      };
      await checkAndWait(func, 500).then(
        () => {
          expect(true).eql(true);
        },
        () => {
          expect(true).eql(false);
        },
      );
    },
  );

  it(
    'post ' + prefix + '/adcs: create ADC HW with install extension exception',
    async function() {
      await givenAdcData(wafapp, {
        management: {trustedDeviceId: 'abcdefg'},
      });

      const adc = createAdcObject({
        type: 'HW',
        management: {
          connection: {
            ipAddress: ExpectedData.networks.management.ipAddr,
            tcpPort: ExpectedData.bigipMgmt.tcpPort,
            username: 'admin',
            password: 'admin',
            rootPass: 'default',
          },
          networks: {},
        },
      });

      let id = uuid();
      trustStub.returns({
        devices: [
          {
            targetUUID: id,
            targetHost: ExpectedData.networks.management.ipAddr,
            state: 'CREATED',
          },
        ],
      });

      queryStub.returns({
        devices: [
          {
            targetUUID: id,
            targetHost: ExpectedData.networks.management.ipAddr,
            state: 'ACTIVE',
          },
        ],
      });

      queryExtensionsStub.returns([]);

      installStub.throws(new Error('install-not-working'));

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(200);

      expect(response.body.adc).to.containDeep(toJSON(adc));

      await sleep(50);

      response = await client
        .get(prefix + '/adcs/' + response.body.adc.id)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      expect(response.body.adc.status).to.equal('INSTALLERROR');
      expect(response.body.adc.lastErr).to.equal(
        `INSTALLERROR: install-not-working`,
      );
    },
  );

  it('get ' + prefix + '/adcs: of all', async () => {
    const adc = await givenAdcData(wafapp);

    let response = await client
      .get(prefix + '/adcs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.adcs).to.containDeep([toJSON(adc)]);
  });

  it('get ' + prefix + '/adcs: with filter string', async () => {
    const adc = await givenAdcData(wafapp);

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
      management: {trustedDeviceId: id},
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
      management: {trustedDeviceId: id},
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
      management: {trustedDeviceId: id},
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
      management: {trustedDeviceId: id},
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

  it('post ' + prefix + '/adcs: create done', async () => {
    let adc = createAdcObject({
      type: 'VE',
      management: {},
    });

    LetResponseWith({
      bigip_get_mgmt_shared_declarative_onboarding_info:
        StubResponses.bigipDOChange2OK200,
    });
    let response = await client
      .post(prefix + '/adcs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(adc)
      .expect(200);

    expect(response.body.adc).hasOwnProperty('id');
    let adcId = response.body.adc.id;
    ExpectedData.bigipMgmt.hostname = adcId + '.f5bigip.local';

    let checkStatus = async () => {
      response = await client
        .get(prefix + '/adcs/' + adcId)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      return response.body.adc.status === 'ONBOARDED';
    };

    await checkAndWait(checkStatus, 50, [], 5).then(() => {});
    expect(response.body.adc.status).eql('ONBOARDED');
    expect(response.body.adc.management.connection.rootPass).not.eql('default');
  });

  it('post ' + prefix + '/adcs: onboard error', async () => {
    let adc = createAdcObject({
      type: 'VE',
      management: {},
    });

    LetResponseWith({
      bigip_get_mgmt_shared_declarative_onboarding_info:
        StubResponses.bigipDOChange2OK200,
      do_get_mgmt_shared_declaration_onboarding_task_taskId:
        StubResponses.onboardingServerError500,
    });

    stubConsoleLog();

    let response = await client
      .post(prefix + '/adcs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(adc)
      .expect(200);

    expect(response.body.adc).hasOwnProperty('id');
    let adcId = response.body.adc.id;
    ExpectedData.bigipMgmt.hostname = adcId + '.f5bigip.local';

    let checkStatus = async () => {
      response = await client
        .get(prefix + '/adcs/' + adcId)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      return response.body.adc.status === 'ONBOARDERROR';
    };

    await checkAndWait(checkStatus, 200, [], 5).then(() => {});
    expect(response.body.adc.status).eql('ONBOARDERROR');
    expect(response.body.adc.lastErr).startWith(
      'ONBOARDERROR: Failed to query onboarding status:',
    );
    expect(response.body.adc.management.connection.rootPass).not.eql('default');

    restoreConsoleLog();
  });

  it('post ' + prefix + '/adcs: onboard timeout', async () => {
    let adc = createAdcObject({
      type: 'VE',
      management: {},
    });

    LetResponseWith({
      bigip_get_mgmt_shared_declarative_onboarding_info:
        StubResponses.bigipDOChange2OK200,
      do_get_mgmt_shared_declaration_onboarding_task_taskId:
        StubResponses.onboardingSucceed202,
    });
    let response = await client
      .post(prefix + '/adcs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(adc)
      .expect(200);

    expect(response.body.adc).hasOwnProperty('id');
    let adcId = response.body.adc.id;
    ExpectedData.bigipMgmt.hostname = adcId + '.f5bigip.local';

    let checkStatus = async () => {
      response = await client
        .get(prefix + '/adcs/' + adcId)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      return response.body.adc.status === 'ONBOARDERROR';
    };

    await checkAndWait(checkStatus, 200, [], 5).then(() => {});
    expect(response.body.adc.status).eql('ONBOARDERROR');
    expect(response.body.adc.lastErr).eql('ONBOARDERROR: timeout');
    expect(response.body.adc.management.connection.rootPass).not.eql('default');
  }).timeout(5000);

  it(`post ${prefix}/adcs: create failed with wrong floatingip state`, async () => {
    setupEnvs({
      VE_RANDOM_PASS: 'false',
    });
    let adc = createAdcObject({
      type: 'VE',
      management: {},
    });

    LetResponseWith({
      neutron_get_v2_0_floatingips:
        StubResponses.neutronGetFloatingIpsStateActive200,
    });

    let response = await client
      .post(prefix + '/adcs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(adc)
      .expect(200);

    expect(response.body.adc).hasOwnProperty('id');
    let adcId = response.body.adc.id;
    ExpectedData.bigipMgmt.hostname = adcId + '.f5bigip.local';

    let checkStatus = async () => {
      let resp = await client
        .get(prefix + '/adcs/' + adcId)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);

      return resp.body.adc.status === 'POWERERROR';
    };

    await checkAndWait(checkStatus, 50, [], 5).then(() => {
      expect(true).true();
    });
  });

  it(
    'post ' + prefix + '/adcs: create done with floatingIP created',
    async () => {
      let adc = createAdcObject({
        type: 'VE',
        management: {},
      });

      LetResponseWith({
        neutron_get_v2_0_floatingips:
          StubResponses.neutronGetFloatingIpsEmpty200,
      });

      let response = await client
        .post(prefix + '/adcs')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(adc)
        .expect(200);

      expect(response.body.adc).hasOwnProperty('id');
      let adcId = response.body.adc.id;
      ExpectedData.bigipMgmt.hostname = adcId + '.f5bigip.local';

      let checkStatus = async () => {
        response = await client
          .get(prefix + '/adcs/' + adcId)
          .set('X-Auth-Token', ExpectedData.userToken)
          .set('tenant-id', ExpectedData.tenantId)
          .expect(200);

        return response.body.adc.status === 'ONBOARDED';
      };

      await checkAndWait(checkStatus, 50, [], 5).then(() => {
        expect(true).true();
      });

      expect(response.body.adc.management.connection.rootPass).eql('default');
    },
  );

  it('post ' + prefix + '/adcs/{adcId}/setup: setup done', async () => {
    let adc = await givenAdcData(wafapp, {
      status: 'ONBOARDED',
    });
    ExpectedData.bigipMgmt.hostname = adc.id + '.f5bigip.local';
    ExpectedData.networks.management.ipAddr = adc.management.connection!.ipAddress;

    LetResponseWith({
      bigip_get_mgmt_shared_declarative_onboarding_info:
        StubResponses.bigipDOChange2OK200,
    });

    let trustDeviceId = uuid();
    trustStub.returns({
      devices: [
        {
          targetUUID: trustDeviceId,
          targetHost: adc.management.connection!.ipAddress,
          state: 'CREATED',
        },
      ],
    });

    queryStub.returns({
      devices: [
        {
          targetUUID: trustDeviceId,
          targetHost: adc.management.connection!.ipAddress,
          state: 'ACTIVE',
        },
      ],
    });

    queryExtensionsStub.onCall(0).returns([]);

    queryExtensionsStub.onCall(1).returns([
      {
        rpmFile: 'f5-appsvcs-3.10.0-5.noarch.rpm',
        name: 'f5-appsvcs',
        state: 'UPLOADING',
      },
    ]);

    queryExtensionsStub.returns([
      {
        rpmFile: 'f5-appsvcs-3.10.0-5.noarch.rpm',
        name: 'f5-appsvcs',
        state: 'AVAILABLE',
      },
    ]);
    let response = await client
      .post(prefix + '/adcs/' + adc.id + '/setup')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(response.body).containDeep({id: adc.id});

    let checkStatus = async () => {
      let resp = await client
        .get(prefix + '/adcs/' + adc.id)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);
      return resp.body.adc.status === 'ACTIVE';
    };

    //TODO: This test can not return comparing failure.
    await checkAndWait(checkStatus, 50, [], 5).then(() => {
      expect(true).true();
    });
  });

  it('post ' + prefix + '/adcs: create done with license key', async () => {
    let adc = createAdcObject({
      type: 'VE',
      license: 'my-fake-license',
      management: {},
    });

    let trustDeviceId = uuid();
    trustStub.returns({
      devices: [
        {
          targetUUID: trustDeviceId,
          targetHost: ExpectedData.networks.management.ipAddr,
          state: 'CREATED',
        },
      ],
    });

    queryStub.returns({
      devices: [
        {
          targetUUID: trustDeviceId,
          targetHost: ExpectedData.networks.management.ipAddr,
          state: 'ACTIVE',
        },
      ],
    });

    queryExtensionsStub.onCall(0).returns([]);

    queryExtensionsStub.onCall(1).returns([
      {
        rpmFile: 'f5-appsvcs-3.10.0-5.noarch.rpm',
        name: 'f5-appsvcs',
        state: 'UPLOADING',
      },
    ]);

    queryExtensionsStub.returns([
      {
        rpmFile: 'f5-appsvcs-3.10.0-5.noarch.rpm',
        name: 'f5-appsvcs',
        state: 'AVAILABLE',
      },
    ]);

    let response = await client
      .post(prefix + '/adcs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(adc)
      .expect(200);

    expect(response.body.adc).hasOwnProperty('id');
    let adcId = response.body.adc.id;
    ExpectedData.bigipMgmt.hostname = adcId + '.f5bigip.local';
    //ExpectedData.bigipMgmt.ipAddr = adc.management.connection!.ipAddress;
    expect(response.body.adc).containDeep({id: adcId});

    let checkStatus = async () => {
      let resp = await client
        .get(prefix + '/adcs/' + adcId)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);
      return resp.body.adc.status === 'ONBOARDED';
    };

    //TODO: This test can not return comparing failure.
    await checkAndWait(checkStatus, 50, [], 5).then(() => {
      expect(true).true();
    });
  });

  it('post ' + prefix + '/adcs/{adcId}: delete done', async () => {
    LetResponseWith({
      bigip_get_mgmt_tm_sys_license: StubResponses.bigipNoLicense200,
    });
    let adc = await givenAdcData(wafapp, {
      type: 'VE',
      status: 'ACTIVE',
    });
    ExpectedData.bigipMgmt.hostname = adc.id + '.f5bigip.local';

    await client
      .del(prefix + '/adcs/' + adc.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(204);

    let resp = {status: 200};
    let checkStatus = async () => {
      resp = await client
        .get(prefix + '/adcs/' + adc.id)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId);

      return resp.status === 404;
    };

    await checkAndWait(checkStatus, 50, [], 5);

    expect(resp.status).equal(404);
  });

  it(
    'post ' + prefix + '/adcs/{adcId}: delete fail due to reclaim error',
    async () => {
      LetResponseWith({
        bigip_get_mgmt_tm_sys_license: StubResponses.bigipNoLicense200,
        nova_del_v2_tenantId_servers_serverId: StubResponses.response404,
      });
      let adc = await givenAdcData(wafapp, {
        type: 'VE',
        status: 'ACTIVE',
      });
      ExpectedData.bigipMgmt.hostname = adc.id + '.f5bigip.local';

      await client
        .del(prefix + '/adcs/' + adc.id)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(204);

      let resp = {body: {adc: {status: 'ACTIVE', lastErr: ''}}};
      let checkStatus = async () => {
        resp = await client
          .get(prefix + '/adcs/' + adc.id)
          .set('X-Auth-Token', ExpectedData.userToken)
          .set('tenant-id', ExpectedData.tenantId);

        return resp.body.adc.status === 'RECLAIMERROR';
      };

      await checkAndWait(checkStatus, 50, [], 5);

      expect(resp.body.adc.status).equal('RECLAIMERROR');
      expect(resp.body.adc.lastErr).containEql('NotFoundError');
    },
  );

  //TODO: the timeout can only be tested through unit test?
  //The following test case leads all tests fail.
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
