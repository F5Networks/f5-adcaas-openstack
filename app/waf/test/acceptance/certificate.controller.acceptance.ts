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

import {Client, expect, toJSON} from '@loopback/testlab';
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
  givenCertificateData,
  createCertificateObject,
} from '../helpers/database.helpers';

import uuid = require('uuid');
import {
  ExpectedData,
  LetResponseWith,
} from '../fixtures/datasources/testrest.datasource';

describe('CertificateController', () => {
  let wafapp: WafApplication;
  let client: Client;
  const prefix = '/adcaas/v1';

  before('setupApplication', async () => {
    await setupDepApps();
    ({wafapp, client} = await setupApplication());
    LetResponseWith({});
    setupEnvs();
  });

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
  });

  after(async () => {
    await teardownApplication(wafapp);
    await teardownDepApps();
    teardownEnvs();
  });

  it('post ' + prefix + '/certificates: with no id', async () => {
    const certificate = createCertificateObject();

    const response = await client
      .post(prefix + '/certificates')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(certificate)
      .expect(200);

    expect(response.body.certificate).to.containDeep(toJSON(certificate));
  });

  it('get ' + prefix + '/certificates: of all', async () => {
    const certificate = await givenCertificateData(wafapp);

    let response = await client
      .get(prefix + '/certificates')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(toJSON(certificate)).to.containDeep(response.body.certificates[0]);
  });

  it('get ' + prefix + '/certificates: with filter string', async () => {
    const certificate = await givenCertificateData(wafapp);

    let response = await client
      .get(prefix + '/certificates')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({filter: {where: {id: certificate.id}}})
      .expect(200);

    expect(toJSON(certificate)).to.containDeep(response.body.certificates[0]);
  });

  it('get ' + prefix + '/certificates/{id}: selected item', async () => {
    const certificate = await givenCertificateData(wafapp);

    let response = await client
      .get(prefix + '/certificates/' + certificate.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(toJSON(certificate)).to.containDeep(response.body.certificate);
  });

  it('get ' + prefix + '/certificates/{id}: not found', async () => {
    await client
      .get(prefix + '/certificates/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });

  it('get ' + prefix + '/certificates/count', async () => {
    let response = await client
      .get(prefix + '/certificates/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(response.body.count).to.eql(0);

    const certificate = await givenCertificateData(wafapp);

    response = await client
      .get(prefix + '/certificates/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({where: {id: certificate.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/certificates/{id}: selected item', async () => {
    const certificate = await givenCertificateData(wafapp);

    let response = await client
      .get(prefix + '/certificates/' + certificate.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(toJSON(certificate)).to.containDeep(response.body.certificate);
  });

  it('patch ' + prefix + '/certificates/{id}: existing item', async () => {
    const patched_name = {name: 'new certificate name'};
    const certificate = await givenCertificateData(wafapp);

    await client
      .patch(prefix + '/certificates/' + certificate.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/certificates/{id}: non-existing item', async () => {
    const patched_name = {name: 'new cert name'};
    await client
      .patch(prefix + '/certificates/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(patched_name)
      .expect(404);
  });

  it('delete ' + prefix + '/certificates/{id}: non-existing item', async () => {
    await client
      .del(prefix + '/certificates/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });

  it('delete ' + prefix + '/certificates/{id}: existing item', async () => {
    const certificate = await givenCertificateData(wafapp);

    await client
      .del(prefix + '/certificates/' + certificate.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(204);
  });
});
