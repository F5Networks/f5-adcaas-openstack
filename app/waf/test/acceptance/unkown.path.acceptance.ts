import {Client} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication} from './test-helper';

describe('Unknown path', () => {
  let app: WafApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('invokes GET /does-not-exist', async () => {
    await client.get('/does-not-exist').expect(404);
  });
});
