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
  givenKeyData,
  createKeyObject,
  givenAdcData,
} from '../helpers/database.helpers';

import uuid = require('uuid');
import {KeyController} from '../../src/controllers';
import {
  ExpectedData,
  LetResponseWith,
} from '../fixtures/datasources/testrest.datasource';

describe('KeyController', () => {
  let wafapp: WafApplication;
  let client: Client;
  let controller: KeyController;
  let uploadKeyStub: sinon.SinonStub;
  let getKeyStub: sinon.SinonStub;
  let installKeyStub: sinon.SinonStub;

  const prefix = '/adcaas/v1';

  before('setupApplication', async () => {
    await setupDepApps();
    ({wafapp, client} = await setupApplication());

    controller = await wafapp.get<KeyController>('controllers.KeyController');

    LetResponseWith({});
    setupEnvs();
  });

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
    uploadKeyStub = sinon.stub(controller.asgService, 'uploadFile');
    getKeyStub = sinon.stub(controller.asgService, 'icontrolGet');
    installKeyStub = sinon.stub(controller.asgService, 'icontrolPost');
  });

  afterEach(async () => {
    uploadKeyStub.restore();
    getKeyStub.restore();
    installKeyStub.restore();
  });

  after(async () => {
    await teardownApplication(wafapp);
    await teardownDepApps();
    teardownEnvs();
  });

  it('post ' + prefix + '/keys: with no id', async () => {
    const key = createKeyObject();

    const response = await client
      .post(prefix + '/certs')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(key)
      .expect(200);

    expect(response.body.cert).to.containDeep(toJSON(key));
  });

  it(
    'post ' + prefix + '/keys/${id}/adcs/${adcId}: uploading a key.',
    async () => {
      const key = await givenKeyData(wafapp);

      const adc = await givenAdcData(wafapp, {
        management: {
          trustedDeviceId: uuid(),
        },
      });
      const name = {
        name: 'test',
        content: 'test',
      };
      uploadKeyStub.returns([]);
      installKeyStub.returns([]);

      await client
        .post(prefix + `/keys/${key.id}/adcs/${adc.id}`)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(name)
        .expect(204);
    },
  );

  it(
    'post ' +
      prefix +
      '/keys/${id}/adcs/${adcId}: uploading a key which does not exist ',
    async () => {
      const key = await givenKeyData(wafapp);

      const adc = await givenAdcData(wafapp, {
        management: {
          trustedDeviceId: uuid(),
        },
      });
      const name = {
        name: 'test',
      };
      uploadKeyStub.returns([]);
      installKeyStub.returns([]);

      await client
        .post(prefix + `/keys/${key.id}/adcs/${adc.id}`)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(name)
        .expect(422);
    },
  );

  it(
    'post ' +
      prefix +
      '/keys/${id}/adcs/${adcId}: uploading a key with an untrunsted device',

    async () => {
      const key = await givenKeyData(wafapp);
      const adc = await givenAdcData(wafapp);
      const name = {
        name: 'test',
      };
      uploadKeyStub.returns([]);
      installKeyStub.returns([]);

      await client
        .post(prefix + `/keys/${key.id}/adcs/${adc.id}`)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(name)
        .expect(422);
    },
  );

  it('get ' + prefix + '/keys: of all', async () => {
    const cert = await givenKeyData(wafapp);

    let response = await client
      .get(prefix + '/keys')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(toJSON(cert)).to.containDeep(response.body.keys[0]);
  });

  it('get ' + prefix + '/keys: with filter string', async () => {
    const key = await givenKeyData(wafapp);

    let response = await client
      .get(prefix + '/keys')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({filter: {where: {id: key.id}}})
      .expect(200);

    expect(toJSON(key)).to.containDeep(response.body.keys[0]);
  });

  it('get ' + prefix + '/keys/count', async () => {
    let response = await client
      .get(prefix + '/keys/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(response.body.count).to.eql(0);

    const key = await givenKeyData(wafapp);

    response = await client
      .get(prefix + '/keys/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({where: {id: key.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/keys/{id}: selected item', async () => {
    const key = await givenKeyData(wafapp);

    let response = await client
      .get(prefix + '/keys/' + key.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(toJSON(key)).to.containDeep(response.body.key);
  });

  it('get ' + prefix + '/keys/{id}: not found', async () => {
    await client
      .get(prefix + '/keys/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });

  it(
    'get ' + prefix + '/keys/${id}/adcs/${adcId}: get keys status',
    async () => {
      const key = await givenKeyData(wafapp, {
        remotepath: 'test',
      });
      const adc = await givenAdcData(wafapp, {
        management: {
          trustedDeviceId: uuid(),
        },
      });

      getKeyStub.returns([]);

      const resp = await client
        .get(prefix + `/keys/${key.id}/adcs/${adc.id}`)
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .expect(200);
      expect(toJSON(key)).to.containDeep(resp.body.key);
    },
  );

  it('patch ' + prefix + '/keys/{id}: existing item', async () => {
    const patched_name = {name: 'new key name'};
    const key = await givenKeyData(wafapp);

    await client
      .patch(prefix + '/keys/' + key.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/keys/{id}: non-existing item', async () => {
    const patched_name = {name: 'new cert name'};
    await client
      .patch(prefix + '/keys/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(patched_name)
      .expect(404);
  });

  it('delete ' + prefix + '/keys/{id}: non-existing item', async () => {
    await client
      .del(prefix + '/keys/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });

  it('delete ' + prefix + '/keys/{id}: existing item', async () => {
    const key = await givenKeyData(wafapp);

    await client
      .del(prefix + '/keys/' + key.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(204);
  });
});
