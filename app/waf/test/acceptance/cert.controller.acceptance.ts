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
  givenCertData,
  createCertObject,
  givenAdcData,
} from '../helpers/database.helpers';

import uuid = require('uuid');
import {CertController} from '../../src/controllers';
import {
  ExpectedData,
  LetResponseWith,
} from '../fixtures/datasources/testrest.datasource';

describe('CertController', () => {
  let wafapp: WafApplication;
  let client: Client;
  let controller: CertController;
  let getCertStub: sinon.SinonStub;
  let uploadCertStub: sinon.SinonStub;
  let installCertStub: sinon.SinonStub;

  const prefix = '/adcaas/v1';

  before('setupApplication', async () => {
    await setupDepApps();
    ({wafapp, client} = await setupApplication());

    controller = await wafapp.get<CertController>('controllers.CertController');

    LetResponseWith({});
    setupEnvs();
  });

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
    uploadCertStub = sinon.stub(controller.asgService, 'uploadFile');
    getCertStub = sinon.stub(controller.asgService, 'icontrolGet');
    installCertStub = sinon.stub(controller.asgService, 'icontrolPost');
  });

  afterEach(async () => {
    uploadCertStub.restore();
    getCertStub.restore();
    installCertStub.restore();
  });

  after(async () => {
    await teardownApplication(wafapp);
    await teardownDepApps();
    teardownEnvs();
  });

  it('post ' + prefix + '/certs: with no id', async () => {
    const cert = createCertObject();

    const response = await client
      .post(prefix + '/certs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(cert)
      .expect(200);

    expect(response.body.cert).to.containDeep(toJSON(cert));
  });

  it(
    'post ' + prefix + '/certs/${id}/adcs/${adcId}: uploading a cert.',
    async () => {
      const cert = await givenCertData(wafapp);

      const adc = await givenAdcData(wafapp, {
        management: {
          trustedDeviceId: uuid(),
        },
      });
      const name = {
        name: 'test',
        content: 'test',
      };
      uploadCertStub.returns([]);
      installCertStub.returns([]);

      await client
        .post(prefix + `/certs/${cert.id}/adcs/${adc.id}`)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(name)
        .expect(204);
    },
  );

  it(
    'post ' +
      prefix +
      '/certs/${id}/adcs/${adcId}: uploading cert which does not exist ',
    async () => {
      const cert = await givenCertData(wafapp);

      const adc = await givenAdcData(wafapp, {
        management: {
          trustedDeviceId: uuid(),
        },
      });
      const name = {
        name: 'test',
      };
      uploadCertStub.returns([]);
      installCertStub.returns([]);

      await client
        .post(prefix + `/certs/${cert.id}/adcs/${adc.id}`)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(name)
        .expect(422);
    },
  );

  it(
    'post ' +
      prefix +
      '/certs/${id}/adcs/${adcId}: uploading cert with an untrunsted device',

    async () => {
      const cert = await givenCertData(wafapp);

      const adc = await givenAdcData(wafapp);
      const name = {
        name: 'test',
      };
      uploadCertStub.returns([]);
      installCertStub.returns([]);

      await client
        .post(prefix + `/certs/${cert.id}/adcs/${adc.id}`)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(name)
        .expect(422);
    },
  );

  it('get ' + prefix + '/certs: of all', async () => {
    const cert = await givenCertData(wafapp);

    let response = await client
      .get(prefix + '/certs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(toJSON(cert)).to.containDeep(response.body.certs[0]);
  });

  it('get ' + prefix + '/certs: with filter string', async () => {
    const cert = await givenCertData(wafapp);

    let response = await client
      .get(prefix + '/certs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({filter: {where: {id: cert.id}}})
      .expect(200);

    expect(toJSON(cert)).to.containDeep(response.body.certs[0]);
  });

  it('get ' + prefix + '/certs/{id}: selected item', async () => {
    const cert = await givenCertData(wafapp);

    let response = await client
      .get(prefix + '/certs/' + cert.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(toJSON(cert)).to.containDeep(response.body.cert);
  });

  it('get ' + prefix + '/certs/{id}: not found', async () => {
    await client
      .get(prefix + '/certs/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });

  it('get ' + prefix + '/certs/count', async () => {
    let response = await client
      .get(prefix + '/certs/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(response.body.count).to.eql(0);

    const cert = await givenCertData(wafapp);

    response = await client
      .get(prefix + '/certs/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({where: {id: cert.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/certs/{id}: selected item', async () => {
    const cert = await givenCertData(wafapp);

    let response = await client
      .get(prefix + '/certs/' + cert.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(toJSON(cert)).to.containDeep(response.body.cert);
  });

  it(
    'get ' + prefix + '/certs/${id}/adcs/${adcId}: get certs status',
    async () => {
      const cert = await givenCertData(wafapp, {
        remotepath: 'test',
      });
      const adc = await givenAdcData(wafapp, {
        management: {
          trustedDeviceId: uuid(),
        },
      });

      getCertStub.returns([]);

      const resp = await client
        .get(prefix + `/certs/${cert.id}/adcs/${adc.id}`)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);
      expect(toJSON(cert)).to.containDeep(resp.body.cert);
    },
  );

  it('patch ' + prefix + '/certs/{id}: existing item', async () => {
    const patched_name = {name: 'new cert name'};
    const cert = await givenCertData(wafapp);

    await client
      .patch(prefix + '/certs/' + cert.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/certs/{id}: non-existing item', async () => {
    const patched_name = {name: 'new cert name'};
    await client
      .patch(prefix + '/certs/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(patched_name)
      .expect(404);
  });

  it('delete ' + prefix + '/certs/{id}: non-existing item', async () => {
    await client
      .del(prefix + '/certs/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });

  it('delete ' + prefix + '/certs/{id}: existing item', async () => {
    const cert = await givenCertData(wafapp);

    await client
      .del(prefix + '/certs/' + cert.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(204);
  });
});
