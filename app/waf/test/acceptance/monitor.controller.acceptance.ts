import {Client, expect} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  createMonitorObject,
  givenMonitorData,
} from '../helpers/database.helpers';
import uuid = require('uuid');

describe('MointorController', () => {
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

  it('post ' + prefix + '/monitors', async () => {
    const monitor = createMonitorObject();

    const response = await client
      .post(prefix + '/monitors')
      .send(monitor)
      .expect(200);

    expect(response.body.id)
      .to.not.empty()
      .and.type('string');
    expect(response.body).to.containDeep(monitor);
  });

  it('post ' + prefix + ' /monitors', async () => {
    const monitor = createMonitorObject();

    const response = await client
      .post(prefix + '/monitors')
      .send(monitor)
      .expect(200);

    expect(response.body.id)
      .to.not.empty()
      .and.type('string');
    expect(response.body).to.containDeep(monitor);
  });

  it('get ' + prefix + '/monitors/count', async () => {
    const monitor = await givenMonitorData(wafapp, {id: uuid()});

    const response = await client
      .get(prefix + '/monitors/count')
      .query({where: {id: monitor.id}})
      .expect(200);

    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/monitors', async () => {
    await givenMonitorData(wafapp, {id: uuid()});

    await client.get(prefix + '/monitors').expect(200);
  });

  it('get ' + prefix + '/monitors/{id}', async () => {
    const monitor = await givenMonitorData(wafapp, {id: uuid()});

    await client.get(prefix + `/monitors/${monitor.id}`).expect(200);
  });

  it('patch ' + prefix + '/monitors/{id}', async () => {
    const monitor = await givenMonitorData(wafapp, {id: uuid()});

    const monitorObject = createMonitorObject({
      id: monitor.id,
      interval: 10,
      targetAddress: '192.0.1.23',
      targetPort: 22,
      monitorType: 'tcp',
      timeout: 16,
    });

    // return no content
    await client
      .patch(prefix + `/monitors/${monitor.id}`)
      .send(monitorObject)
      .expect(204);

    await client.get(prefix + `/monitors/${monitor.id}`).expect(200);
  });

  it('delete ' + prefix + '/monitors/{id}', async () => {
    const monitor = await givenMonitorData(wafapp, {id: uuid()});
    await client.del(prefix + `/monitors/${monitor.id}`).expect(204);
    await client.get(prefix + `/monitors/${monitor.id}`).expect(404);
  });
});
