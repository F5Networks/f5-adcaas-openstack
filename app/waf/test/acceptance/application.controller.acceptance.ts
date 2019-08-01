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
import {
  setupApplication,
  teardownApplication,
  setupEnvs,
  teardownEnvs,
  setupDepApps,
  teardownDepApps,
} from '../helpers/testsetup-helper';
import {
  givenEmptyDatabase,
  givenApplicationData,
  givenAdcData,
  createApplicationObject,
} from '../helpers/database.helpers';
import uuid = require('uuid');
import {ASGServiceProvider, ASGService} from '../../src/services/asg.service';
import {
  ExpectedData,
  LetResponseWith,
} from '../fixtures/datasources/testrest.datasource';

describe('ApplicationController', () => {
  let wafapp: WafApplication;
  let client: Client;
  let deployStub: sinon.SinonStub;
  let asg: ASGService;

  const prefix = '/adcaas/v1';

  before('setupApplication', async () => {
    await setupDepApps();
    ({wafapp, client} = await setupApplication());

    asg = await new ASGServiceProvider().value();

    LetResponseWith({});
    setupEnvs();
  });

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
    deployStub = sinon.stub(asg, 'deploy');
  });

  after(async () => {
    await teardownApplication(wafapp);
    await teardownDepApps();
    teardownEnvs();
  });

  afterEach(async () => {
    deployStub.restore();
  });

  it('post ' + prefix + '/applications: with no id', async () => {
    const application = createApplicationObject();

    const response = await client
      .post(prefix + '/applications')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(application)
      .expect(200);

    expect(response.body.application).to.containDeep(toJSON(application));
  });

  it('get ' + prefix + '/applications: of all', async () => {
    const application = await givenApplicationData(wafapp);

    let response = await client
      .get(prefix + '/applications')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect('Content-Type', /application\/json/);

    expect(toJSON(application)).to.containDeep(response.body.applications[0]);
  });

  it('get ' + prefix + '/applications: with filter string', async () => {
    const application = await givenApplicationData(wafapp);

    let response = await client
      .get(prefix + '/applications')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({filter: {where: {id: application.id}}})
      .expect(200);

    expect(toJSON(application)).to.containDeep(response.body.applications[0]);
  });

  it('get ' + prefix + '/applications/count', async () => {
    let response = await client
      .get(prefix + '/applications/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(response.body.count).to.eql(0);

    const application = await givenApplicationData(wafapp);

    response = await client
      .get(prefix + '/applications/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({where: {id: application.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/applications/{id}: selected item', async () => {
    await givenApplicationData(wafapp);
    const application = await givenApplicationData(wafapp);

    let response = await client
      .get(prefix + '/applications/' + application.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(toJSON(application)).to.containDeep(response.body.application);
  });

  it('get ' + prefix + '/applications/{id}: not found', async () => {
    await client
      .get(prefix + '/applications/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });

  it('patch ' + prefix + '/applications/{id}: existing item', async () => {
    const patched_name = {name: 'new application name'};
    const application = await givenApplicationData(wafapp);

    await client
      .patch(prefix + '/applications/' + application.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/applications/{id}: non-existing item', async () => {
    const patched_name = {name: 'new application name'};
    await client
      .patch(prefix + '/applications/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(patched_name)
      .expect(404);
  });

  it('delete ' + prefix + '/applications/{id}: non-existing item', async () => {
    await client
      .del(prefix + '/applications/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });

  it('delete ' + prefix + '/applications/{id}: existing item', async () => {
    const application = await givenApplicationData(wafapp);

    await client
      .del(prefix + '/applications/' + application.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(204);
  });

  it(
    'post ' +
      prefix +
      '/applications/{id}/deploy: deploy the first application.',
    async () => {
      let adc = await givenAdcData(wafapp);
      let application = await givenApplicationData(wafapp, {
        adcId: adc.id,
      });

      let response = await client
        .post(prefix + '/applications/' + application.id + '/declarations')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send({name: 'a-declaration'})
        .expect(200);

      await client
        .patch(prefix + '/applications/' + application.id)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send({defaultDeclarationId: response.body.declaration.id})
        .expect(204);

      deployStub
        .onCall(0)
        .throws(Object('InvalidPatchOperationError: path does not exist'));

      await client
        .post(prefix + '/applications/' + application.id + '/deploy')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(204);
    },
  );

  it(
    'post ' +
      prefix +
      '/applications/{id}/deploy: deploy an application with partition',
    async () => {
      let adc = await givenAdcData(wafapp);
      let application = await givenApplicationData(wafapp, {
        adcId: adc.id,
      });

      let response = await client
        .post(prefix + '/applications/' + application.id + '/declarations')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send({name: 'a-declaration'})
        .expect(200);

      await client
        .patch(prefix + '/applications/' + application.id)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send({defaultDeclarationId: response.body.declaration.id})
        .expect(204);

      deployStub.returns(Promise.resolve('Hello'));

      await client
        .post(prefix + '/applications/' + application.id + '/deploy')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(204);
    },
  );

  it(
    'post ' + prefix + '/applications/{id}/deploy: deploy without adcId',
    async () => {
      let application = await givenApplicationData(wafapp);

      await client
        .post(prefix + '/applications/' + application.id + '/deploy')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(422);
    },
  );

  it(
    'post ' + prefix + '/applications/{id}/deploy: deploy without declaration',
    async () => {
      let adc = await givenAdcData(wafapp);

      let application = await givenApplicationData(wafapp, {
        adcId: adc.id,
      });

      deployStub.returns(Promise.resolve('Hello'));

      await client
        .post(prefix + '/applications/' + application.id + '/deploy')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(422);
    },
  );

  it(
    'post ' + prefix + '/applications/{id}/cleanup: undeploy application',
    async () => {
      let adc = await givenAdcData(wafapp);
      let application = await givenApplicationData(wafapp, {
        adcId: adc.id,
      });

      deployStub.returns(Promise.resolve('Hello'));

      await client
        .post(prefix + '/applications/' + application.id + '/cleanup')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(204);
    },
  );

  it(
    'post ' + prefix + '/applications/{id}/cleanup: undeploy without adcId',
    async () => {
      let application = await givenApplicationData(wafapp);

      await client
        .post(prefix + '/applications/' + application.id + '/cleanup')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(422);
    },
  );

  it('post ' + prefix + '/applications without body', async () => {
    const response = await client
      .post(prefix + '/applications')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send()
      .expect(400);

    expect(response.body.error.code).to.equal('MISSING_REQUIRED_PARAMETER');
  });

  it('post ' + prefix + '/applications with invalid property', async () => {
    let request = {
      abc: 'ABC',
    };

    const response = await client
      .post(prefix + '/applications')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(request)
      .expect(422);

    expect(response.body.error.name).to.equal('ValidationError');
    expect(response.body.error.details.codes).to.containDeep({
      abc: ['unknown-property'],
    });
  });

  it('post ' + prefix + '/applications with invalid value type', async () => {
    let request = {
      adcId: 1.21,
    };
    const response = await client
      .post(prefix + '/applications')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(request)
      .expect(422);

    expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    expect(response.body.error.details[0].code).to.equal('type');
  });

  it(
    'post ' + prefix + '/applications with incorrect uuid format',
    async () => {
      let request = {
        adcId: 'a'.repeat(30),
      };

      const response = await client
        .post(prefix + '/applications')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(request)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
      expect(response.body.error.details[0].code).to.equal('format');
    },
  );

  it('patch' + prefix + '/applications/{applicationId}', async () => {
    let adc = await givenAdcData(wafapp);
    let application = await givenApplicationData(wafapp, {
      adcId: adc.id,
    });

    await client
      .patch(prefix + '/applications/' + application.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send({adcId: adc.id})
      .expect(204);

    const response = await client
      .get(prefix + `/applications/${application.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(response.body.application.adcId).to.equal(adc.id);
  });

  it(
    'patch' + prefix + '/applications/{applicationId} without body',
    async () => {
      const response = await client
        .patch(prefix + '/applications/abcd')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send()
        .expect(400);

      expect(response.body.error.code).to.equal('MISSING_REQUIRED_PARAMETER');
    },
  );

  it(
    'patch' + prefix + '/applications/{applicationId} with incorrect adc id',
    async () => {
      let application = await givenApplicationData(wafapp, {
        adcId: uuid(),
      });

      await client
        .patch(prefix + '/applications/' + application.id)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send({adcId: uuid()})
        .expect(404);
    },
  );
});
