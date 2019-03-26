import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenServiceData,
} from '../helpers/database.helpers';
import uuid = require('uuid');

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
    await teardownApplication(wafapp);
  });

  it('get' + prefix + '/services/count', async () => {
    const service = await givenServiceData(wafapp, uuid(), {id: uuid()});

    const response = await client
      .get(prefix + '/services/count')
      .query({where: {id: service.id}})
      .expect(200);

    expect(response.body.count).to.eql(1);
  });

  it('get' + prefix + '/services', async () => {
    const service = await givenServiceData(wafapp, uuid(), {id: uuid()});

    let response = await client.get(prefix + '/services').expect(200);
    expect(response.body.services).to.containDeep([toJSON(service)]);
  });

  it('get' + prefix + '/services/{id}', async () => {
    const service = await givenServiceData(wafapp, uuid(), {id: uuid()});

    let response = await client
      .get(prefix + `/services/${service.id}`)
      .expect(200);

    expect(response.body.service).to.containDeep(toJSON(service));
  });

  it('post ' + prefix + '/services', async () => {
    const request = {
      type: 'HTTPS',
      virtualAddresses: ['10.0.1.11', '10.0.2.11'],
      virtualPort: 443,
      pool: 'web_pool',
      applicationId: uuid(),
    };

    const response = await client
      .post(prefix + '/services')
      .send(request)
      .expect(200);

    expect(response.body.service.id)
      .to.not.empty()
      .and.type('string');
    expect(response.body.service).to.containDeep(request);
  });

  it('delete' + prefix + '/services/{id}', async () => {
    const service = await givenServiceData(wafapp, uuid(), {id: uuid()});

    await client.del(prefix + `/services/${service.id}`).expect(204);

    await client.get(prefix + `/services/${service.id}`).expect(404);
  });
});
