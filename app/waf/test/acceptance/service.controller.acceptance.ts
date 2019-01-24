// Copyright F5 Networks, Inc. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  giveServiceData,
  createServiceObjectWithoutID,
} from '../helpers/database.helpers';

describe('ServiceController', () => {
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
    await wafapp.stop();
  });

  it('post ' + prefix + '/services', async () => {
    const service = createServiceObjectWithoutID({
      class: 'Service_HTTP',
      virtualAddresses: ['10.0.1.11', '10.0.2.11'],
      virtualPort: 443,
      pool: 'web_pool',
    });

    const response = await client
      .post(prefix + '/services')
      .send(service)
      .expect(200);

    expect(response.body.id)
      .to.not.empty()
      .and.type('string');
    expect(response.body).to.containDeep(service);
  });

  it('get' + prefix + '/services/count', async () => {
    const service = await giveServiceData(wafapp);

    const response = await client
      .get(prefix + '/services/count')
      .query({where: {id: service.id}})
      .expect(200);

    expect(response.body.count).to.eql(1);
  });

  it('get' + prefix + '/services', async () => {
    const service = await giveServiceData(wafapp);

    await client
      .get(prefix + '/services')
      .query({where: {class: service.class}})
      .expect(200, [toJSON(service)]);
  });

  it('get' + prefix + '/services', async () => {
    const service = await giveServiceData(wafapp);

    await client
      .get(prefix + '/services')
      .query({filter: {where: {class: service.class}}})
      .expect(200, [toJSON(service)]);
  });

  it('patch' + prefix + '/services', async () => {
    const serviceObject = createServiceObjectWithoutID({
      class: 'Service_HTTP',
      virtualAddresses: ['10.0.1.11', '10.0.2.11'],
      virtualPort: 443,
      pool: 'web_pool',
    });

    const service = await giveServiceData(wafapp);

    // pzhang(NOTE): return a count
    const response = await client
      .patch(prefix + `/services`)
      .query({where: {class: service.class}})
      .send(serviceObject)
      .expect(200);

    expect(response.body.count).to.equal(1);

    // pzhang(NOTE): id will not change in generic  patch with id method.
    serviceObject.id = service.id;

    await client
      .get(prefix + `/services/${service.id}`)
      .expect(200, toJSON(serviceObject));
  });

  it('get' + prefix + '/services/{id}', async () => {
    const service = await giveServiceData(wafapp);

    await client
      .get(prefix + `/services/${service.id}`)
      .expect(200, toJSON(service));
  });

  it('patch' + prefix + '/services/{id}', async () => {
    const serviceObject = createServiceObjectWithoutID({
      class: 'Service_HTTP',
      virtualAddresses: ['10.0.1.11', '10.0.2.11'],
      virtualPort: 443,
      pool: 'web_pool',
    });

    const service = await giveServiceData(wafapp);
    // pzhang(NOTE): return no content
    await client
      .patch(prefix + `/services/${service.id}`)
      .send(serviceObject)
      .expect(204);

    // pzhang(NOTE): id will not change in generic  patch with id method.
    serviceObject.id = service.id;

    await client
      .get(prefix + `/services/${service.id}`)
      .expect(200, toJSON(serviceObject));
  });

  it('put' + prefix + '/services/{id}', async () => {
    const service = await giveServiceData(wafapp);

    const serviceObject = createServiceObjectWithoutID({
      class: 'Service_HTTP',
      virtualAddresses: ['10.0.1.11', '10.0.2.11'],
      virtualPort: 443,
    });

    await client
      .put(prefix + `/services/${service.id}`)
      .send(serviceObject)
      .expect(204);

    serviceObject.id = service.id;

    await client
      .get(prefix + `/services/${service.id}`)
      .expect(200, toJSON(serviceObject));
  });

  it('delete' + prefix + '/services/{id}', async () => {
    const service = await giveServiceData(wafapp);

    await client.del(prefix + `/services/${service.id}`).expect(204);

    await client.get(prefix + `/services/${service.id}`).expect(404);
  });
});
