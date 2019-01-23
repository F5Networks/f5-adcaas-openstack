import {Client, expect, sinon} from '@loopback/testlab';
import {WafApplication} from '../..';
import {PingController} from '../../src/controllers';
import {setupApplication} from '../helpers/test-helper';

const prefix = '/adcaas/v1';

describe('PingController', () => {
  let wafapp: WafApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({wafapp, client} = await setupApplication());
  });

  beforeEach(async () => {
    sinon.stub(PingController.prototype, 'getAS3Info');
  });

  after(async () => {
    await wafapp.stop();
    sinon.restore();
  });

  it('invokes GET ' + prefix + '/ping', async () => {
    const res = await client.get(prefix + '/ping').expect(200);
    expect(res.body).to.containEql({greeting: 'Hello from LoopBack'});
  });
});
