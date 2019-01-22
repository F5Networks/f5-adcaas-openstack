import {Client, expect} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication} from './test-helper';

const prefix = '/adcaas/v1';

describe('PingController', () => {
  let app: WafApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('invokes GET ' + prefix + '/ping', async () => {
    const res = await client.get(prefix + '/ping?msg=world').expect(200);
    expect(res.body).to.containEql({greeting: 'Hello from LoopBack'});
  });
});
