import {Client} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';

describe('Unknown path', () => {
  let wafapp: WafApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({wafapp, client} = await setupApplication());
  });

  after(async () => {
    await teardownApplication(wafapp);
  });

  it('invokes GET /does-not-exist', async () => {
    await client.get('/does-not-exist').expect(404);
  });
});
