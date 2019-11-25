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
  givenTLSServerData,
  createTLSServerObject,
} from '../helpers/database.helpers';

import uuid = require('uuid');
import {
  ExpectedData,
  LetResponseWith,
} from '../fixtures/datasources/testrest.datasource';

describe('TLSServerController', () => {
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

  it('post ' + prefix + '/tlsservers: with no id', async () => {
    const tlsserver = createTLSServerObject();

    const response = await client
      .post(prefix + '/tlsservers')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(tlsserver)
      .expect(200);

    expect(response.body.tlsserver).to.containDeep(toJSON(tlsserver));
  });

  it('get ' + prefix + '/tlsservers: of all', async () => {
    const tlsserver = await givenTLSServerData(wafapp);

    let response = await client
      .get(prefix + '/tlsservers')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(toJSON(tlsserver)).to.containDeep(response.body.tlsservers[0]);
  });

  it('get ' + prefix + '/tlsservers: with filter string', async () => {
    const tlsserver = await givenTLSServerData(wafapp);

    let response = await client
      .get(prefix + '/tlsservers')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({filter: {where: {id: tlsserver.id}}})
      .expect(200);

    expect(toJSON(tlsserver)).to.containDeep(response.body.tlsservers[0]);
  });

  it('get ' + prefix + '/tlsservers/{id}: selected item', async () => {
    const tlsserver = await givenTLSServerData(wafapp);

    let response = await client
      .get(prefix + '/tlsservers/' + tlsserver.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(toJSON(tlsserver)).to.containDeep(response.body.tlsserver);
  });

  it('get ' + prefix + '/tlsservers/{id}: not found', async () => {
    await client
      .get(prefix + '/tlsservers/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });

  it('get ' + prefix + '/tlsservers/count', async () => {
    let response = await client
      .get(prefix + '/tlsservers/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(response.body.count).to.eql(0);

    const tlsserver = await givenTLSServerData(wafapp);

    response = await client
      .get(prefix + '/tlsservers/count')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .query({where: {id: tlsserver.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/tlsservers/{id}: selected item', async () => {
    const tlsserver = await givenTLSServerData(wafapp);

    let response = await client
      .get(prefix + '/tlsservers/' + tlsserver.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(toJSON(tlsserver)).to.containDeep(response.body.tlsserver);
  });

  it('patch ' + prefix + '/tlsservers/{id}: existing item', async () => {
    const patched_name = {name: 'new tlsserver name'};
    const tlsserver = await givenTLSServerData(wafapp);

    await client
      .patch(prefix + '/tlsservers/' + tlsserver.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/tlsservers/{id}: non-existing item', async () => {
    const patched_name = {name: 'new tlsserver name'};
    await client
      .patch(prefix + '/tlsservers/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(patched_name)
      .expect(404);
  });

  it('delete ' + prefix + '/tlsservers/{id}: non-existing item', async () => {
    await client
      .del(prefix + '/tlsservers/' + uuid())
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });

  it('delete ' + prefix + '/tlsservers/{id}: existing item', async () => {
    const tlsserver = await givenTLSServerData(wafapp);

    await client
      .del(prefix + '/tlsservers/' + tlsserver.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(204);
  });
});
