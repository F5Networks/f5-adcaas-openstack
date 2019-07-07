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
  givenServiceData,
  givenApplicationData,
  givenPoolData,
} from '../helpers/database.helpers';
import {deepcopy} from '../../src/utils';
import {
  ExpectedData,
  LetResponseWith,
} from '../fixtures/datasources/testrest.datasource';

import uuid = require('uuid');

const defaultRequest = {
  type: 'HTTPS',
  virtualAddresses: ['10.0.1.11'],
  virtualPort: 443,
  applicationId: uuid(),
};

describe('ServiceController', () => {
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

  it('get' + prefix + '/services', async () => {
    const service = await givenServiceData(wafapp, uuid(), {id: uuid()});

    let response = await client
      .get(prefix + '/services')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(toJSON(service)).to.containDeep(response.body.services[0]);
  });

  it('get' + prefix + '/services/{id}', async () => {
    const service = await givenServiceData(wafapp, uuid(), {id: uuid()});

    let response = await client
      .get(prefix + `/services/${service.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(toJSON(service)).to.containDeep(response.body.service);
  });

  it('post ' + prefix + '/services', async () => {
    const application = await givenApplicationData(wafapp);
    const pool = await givenPoolData(wafapp);
    const request = Object.assign(deepcopy(defaultRequest), {
      applicationId: application.id,
      defaultPoolId: pool.id,
    });

    const response = await client
      .post(prefix + '/services')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(request)
      .expect(200);

    expect(response.body.service.id)
      .to.not.empty()
      .and.type('string');
    expect(response.body.service).to.containDeep(request);
  });

  it('post ' + prefix + '/services with incorrect application id', async () => {
    const request = deepcopy(defaultRequest);

    const response = await client
      .post(prefix + '/services')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(request)
      .expect(404);

    expect(response.body.error.message).to.startWith(
      'Entity not found: Application',
    );
  });

  it('post ' + prefix + '/services without body', async () => {
    const response = await client
      .post(prefix + '/services')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send()
      .expect(400);

    expect(response.body.error.code).to.equal('MISSING_REQUIRED_PARAMETER');
  });

  it('post ' + prefix + '/services without required property', async () => {
    let request = deepcopy(defaultRequest);
    delete request.type;

    const response = await client
      .post(prefix + '/services')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(request)
      .expect(422);

    expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    expect(response.body.error.details[0].code).to.equal('required');
  });

  it('post ' + prefix + '/services with invalid property', async () => {
    const application = await givenApplicationData(wafapp);
    let request = Object.assign(deepcopy(defaultRequest), {
      abc: 'ABC',
      applicationId: application.id,
    });

    const response = await client
      .post(prefix + '/services')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(request)
      .expect(422);

    expect(response.body.error.name).to.equal('ValidationError');
    expect(response.body.error.details.codes).to.containDeep({
      abc: ['unknown-property'],
    });
  });

  it('post ' + prefix + '/services with invalid value type', async () => {
    let request = Object.assign(deepcopy(defaultRequest), {virtualPort: 1.23});

    const response = await client
      .post(prefix + '/services')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(request)
      .expect(422);

    expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    expect(response.body.error.details[0].code).to.equal('type');
  });

  it('post ' + prefix + '/services with invalid enum value', async () => {
    let request = Object.assign(deepcopy(defaultRequest), {type: 'WRONG'});

    const response = await client
      .post(prefix + '/services')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(request)
      .expect(422);

    expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    expect(response.body.error.details[0].code).to.equal('enum');
  });

  it(
    'post ' + prefix + '/services with value exceeds valid range',
    async () => {
      let request = Object.assign(deepcopy(defaultRequest), {virtualPort: -10});

      const response = await client
        .post(prefix + '/services')
        .set('X-Auth-Token', ExpectedData.userToken)
        .set('tenant-id', ExpectedData.tenantId)
        .send(request)
        .expect(422);

      expect(response.body.error.code).to.equal('VALIDATION_FAILED');
      expect(response.body.error.details[0].code).to.equal('minimum');
    },
  );

  it('post ' + prefix + '/services with very long name', async () => {
    let request = Object.assign(deepcopy(defaultRequest), {name: ''});

    const response = await client
      .post(prefix + '/services')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(request)
      .expect(422);

    expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    expect(response.body.error.details[0].code).to.equal('minLength');
  });

  it('post ' + prefix + '/services with very long name', async () => {
    let request = Object.assign(deepcopy(defaultRequest), {
      name: 'a'.repeat(100),
    });

    const response = await client
      .post(prefix + '/services')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(request)
      .expect(422);

    expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    expect(response.body.error.details[0].code).to.equal('maxLength');
  });

  it('post ' + prefix + '/services with incorrect uuid format', async () => {
    let request = Object.assign(deepcopy(defaultRequest), {
      applicationId: 'a'.repeat(30),
    });

    const response = await client
      .post(prefix + '/services')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(request)
      .expect(422);

    expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    expect(response.body.error.details[0].code).to.equal('format');
  });

  it('post ' + prefix + '/services with incorrect uuid format', async () => {
    let request = Object.assign(deepcopy(defaultRequest), {
      virtualAddresses: [],
    });

    const response = await client
      .post(prefix + '/services')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(request)
      .expect(422);

    expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    expect(response.body.error.details[0].code).to.equal('minItems');
  });

  it('post ' + prefix + '/services with incorrect uuid format', async () => {
    let request = Object.assign(deepcopy(defaultRequest), {
      virtualAddresses: ['10.0.1.11', '10.0.2.11'],
    });

    const response = await client
      .post(prefix + '/services')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(request)
      .expect(422);

    expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    expect(response.body.error.details[0].code).to.equal('maxItems');
  });

  it('post ' + prefix + '/services with incorrect vip type', async () => {
    let request = Object.assign(deepcopy(defaultRequest), {
      virtualAddresses: [123],
    });

    const response = await client
      .post(prefix + '/services')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(request)
      .expect(422);

    expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    expect(response.body.error.details[0].code).to.equal('type');
  });

  it('post ' + prefix + '/services with incorrect vip format', async () => {
    let request = Object.assign(deepcopy(defaultRequest), {
      virtualAddresses: ['1.2.3.a'],
    });

    const response = await client
      .post(prefix + '/services')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(request)
      .expect(422);

    expect(response.body.error.code).to.equal('VALIDATION_FAILED');
    expect(response.body.error.details[0].code).to.equal('format');
  });

  it('patch' + prefix + '/services/{id}', async () => {
    const service = await givenServiceData(wafapp, uuid(), {
      defaultPoolId: uuid(),
    });
    const pool = await givenPoolData(wafapp);

    await client
      .patch(prefix + '/services/' + service.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send({defaultPoolId: pool.id})
      .expect(204);

    const response = await client
      .get(prefix + `/services/${service.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(response.body.service.defaultPoolId).to.equal(pool.id);
  });

  it('patch' + prefix + '/services/{id} without body', async () => {
    const response = await client
      .patch(prefix + '/services/abcd')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send()
      .expect(400);

    expect(response.body.error.code).to.equal('MISSING_REQUIRED_PARAMETER');
  });

  it('patch' + prefix + '/services/{id} without body', async () => {
    const response = await client
      .patch(prefix + '/services/abcd')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send()
      .expect(400);

    expect(response.body.error.code).to.equal('MISSING_REQUIRED_PARAMETER');
  });

  it('patch' + prefix + '/services/{id} with incorrect pool id', async () => {
    const service = await givenServiceData(wafapp, uuid(), {
      defaultPoolId: uuid(),
    });

    await client
      .patch(prefix + '/services/' + service.id)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send({defaultPoolId: uuid()})
      .expect(404);
  });

  it('delete' + prefix + '/services/{id}', async () => {
    const service = await givenServiceData(wafapp, uuid(), {id: uuid()});

    await client
      .del(prefix + `/services/${service.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(204);

    await client
      .get(prefix + `/services/${service.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });
});
