import {Client, expect, sinon} from '@loopback/testlab';
import {WafApplication} from '../..';
import {PingController} from '../../src/controllers';
import {setupApplication} from './test-helper';

const prefix = '/adcaas/v1';

describe('PingController', () => {
  let app: WafApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
    sinon.stub(PingController.prototype, 'getAS3Info');
  });

  after(async () => {
    await app.stop();
    sinon.restore();
  });

  it('invokes GET ' + prefix + '/ping', async () => {
    const res = await client.get(prefix + '/ping?msg=world').expect(200);
    expect(res.body).to.containEql({greeting: 'Hello from LoopBack'});
  });
});
