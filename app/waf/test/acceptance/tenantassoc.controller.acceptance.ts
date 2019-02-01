// Copyright F5 Networks, Inc. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenTenantAssociationData,
} from '../helpers/database.helpers';
import uuid = require('uuid');

describe('TenantAssociationController', () => {
  let wafapp: WafApplication;
  let client: Client;

  const prefix = '/adcaas/v1';

  before('setupApplication', async () => {
    ({wafapp, client} = await setupApplication());
  });

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
  });

  after(async () => {
    await teardownApplication(wafapp);
  });

  it('post ' + prefix + '/tenantassocs', async () => {
    let body = {
      tenantId: 'abcd',
      adcId: '1234',
    };

    await client
      .post(prefix + '/tenantassocs')
      .send(body)
      .expect(200);
  });

  it('get ' + prefix + '/tenantassocs: of all', async () => {
    await client
      .get(prefix + '/tenantassocs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('get ' + prefix + '/tenantassocs/count', async () => {
    let response = await client.get(prefix + '/tenantassocs/count').expect(200);
    expect(response.body.count).to.eql(0);

    const tenantAssoc = await givenTenantAssociationData(wafapp);

    response = await client
      .get(prefix + '/tenantassocs/count')
      .query({where: {tenantId: tenantAssoc.tenantId}})
      .expect(200);

    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/tenantassocs/{id}: selected item', async () => {
    let tenantAssoc = await givenTenantAssociationData(wafapp);

    await client
      .get(prefix + '/tenantassocs/' + tenantAssoc.tenantId)
      .expect(200, toJSON(tenantAssoc));
  });

  it('get ' + prefix + '/tenantassocs/{id}: not found', async () => {
    await client.get(prefix + '/tenantassocs/' + uuid()).expect(404);
  });

  it('patch ' + prefix + '/tenantassocs/{id}: existing item', async () => {
    const body = {
      adcId: '2345',
    };
    const tenantAssoc = await givenTenantAssociationData(wafapp);

    await client
      .patch(prefix + '/tenantassocs/' + tenantAssoc.tenantId)
      .send(body)
      .expect(204, '');
  });

  it('patch ' + prefix + '/tenantassocs/{id}: non-existing item', async () => {
    const body = {
      adcId: '2345',
    };
    await client
      .patch(prefix + '/tenantassocs/' + uuid())
      .send(body)
      .expect(404);
  });

  it('delete ' + prefix + '/tenantassocs/{id}: non-existing item', async () => {
    await client.del(prefix + '/tenantassocs/' + uuid()).expect(404);
  });

  it('delete ' + prefix + '/tenantassocs/{id}: existing item', async () => {
    const tenantAssoc = await givenTenantAssociationData(wafapp);

    await client
      .del(prefix + '/tenantassocs/' + tenantAssoc.tenantId)
      .expect(204);
  });
});
