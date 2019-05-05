// Copyright F5 Networks, Inc. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect, sinon, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {ApplicationController} from '../../src/controllers';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenApplicationData,
  givenAdcData,
  createApplicationObject,
} from '../helpers/database.helpers';
import uuid = require('uuid');

describe('ApplicationController', () => {
  let wafapp: WafApplication;
  let controller: ApplicationController;
  let client: Client;
  let deployStub: sinon.SinonStub;

  const prefix = '/adcaas/v1';

  before('setupApplication', async () => {
    ({wafapp, client} = await setupApplication());

    controller = await wafapp.get<ApplicationController>(
      'controllers.ApplicationController',
    );
  });

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
    deployStub = sinon.stub(controller.as3Service, 'deploy');
  });

  after(async () => {
    await teardownApplication(wafapp);
  });

  afterEach(async () => {
    deployStub.restore();
  });

  it('post ' + prefix + '/applications: with no id', async () => {
    const application = createApplicationObject();

    const response = await client
      .post(prefix + '/applications')
      .send(application)
      .expect(200);

    expect(response.body.application).to.containDeep(toJSON(application));
  });

  it('get ' + prefix + '/applications: of all', async () => {
    const application = await givenApplicationData(wafapp);

    let response = await client
      .get(prefix + '/applications')
      .expect('Content-Type', /application\/json/);

    expect(response.body.applications[0]).to.containDeep(toJSON(application));
  });

  it('get ' + prefix + '/applications: with filter string', async () => {
    const application = await givenApplicationData(wafapp);

    let response = await client
      .get(prefix + '/applications')
      .query({filter: {where: {id: application.id}}})
      .expect(200);

    expect(response.body.applications[0]).to.containDeep(toJSON(application));
  });

  it('get ' + prefix + '/applications/count', async () => {
    let response = await client.get(prefix + '/applications/count').expect(200);
    expect(response.body.count).to.eql(0);

    const application = await givenApplicationData(wafapp);

    response = await client
      .get(prefix + '/applications/count')
      .query({where: {id: application.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/applications/{id}: selected item', async () => {
    await givenApplicationData(wafapp);
    const application = await givenApplicationData(wafapp);

    let response = await client
      .get(prefix + '/applications/' + application.id)
      .expect(200);

    expect(response.body.application).to.containDeep(toJSON(application));
  });

  it('get ' + prefix + '/applications/{id}: not found', async () => {
    await client.get(prefix + '/applications/' + uuid()).expect(404);
  });

  it('patch ' + prefix + '/applications/{id}: existing item', async () => {
    const patched_name = {name: 'new application name'};
    const application = await givenApplicationData(wafapp);

    await client
      .patch(prefix + '/applications/' + application.id)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/applications/{id}: non-existing item', async () => {
    const patched_name = {name: 'new application name'};
    await client
      .patch(prefix + '/applications/' + uuid())
      .send(patched_name)
      .expect(404);
  });

  it('delete ' + prefix + '/applications/{id}: non-existing item', async () => {
    await client.del(prefix + '/applications/' + uuid()).expect(404);
  });

  it('delete ' + prefix + '/applications/{id}: existing item', async () => {
    const application = await givenApplicationData(wafapp);

    await client.del(prefix + '/applications/' + application.id).expect(204);
  });

  it(
    'post ' + prefix + '/applications/{id}/deploy: deploy application',
    async () => {
      let adc = await givenAdcData(wafapp);
      let application = await givenApplicationData(wafapp, {
        adcId: adc.id,
      });

      let response = await client
        .post(prefix + '/applications/' + application.id + '/declarations')
        .send({name: 'a-declaration'})
        .expect(200);

      await client
        .patch(prefix + '/applications/' + application.id)
        .send({defaultDeclarationId: response.body.declaration.id})
        .expect(204);

      deployStub.returns(Promise.resolve('Hello'));

      await client
        .post(prefix + '/applications/' + application.id + '/deploy')
        .expect(200);
    },
  );

  it(
    'post ' + prefix + '/applications/{id}/deploy: deploy without adcId',
    async () => {
      let application = await givenApplicationData(wafapp, {});

      await client
        .post(prefix + '/applications/' + application.id + '/deploy')
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
        .expect(200);
    },
  );

  it(
    'post ' + prefix + '/applications/{id}/cleanup: undeploy without adcId',
    async () => {
      let application = await givenApplicationData(wafapp, {});

      await client
        .post(prefix + '/applications/' + application.id + '/cleanup')
        .expect(422);
    },
  );
});
