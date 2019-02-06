import {Client, expect, httpGetAsync} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  testrest_config,
  testrest,
} from '../fixtures/datasources/testrest.as3.datasource';
import {setupRestServer, teardownRestServer} from '../helpers/rest.helpers';

const prefix = '/adcaas/v1';

describe('PingController', () => {
  let wafapp: WafApplication;
  let client: Client;
  let restPort = 8443;

  before('setupApplication', async () => {
    ({wafapp, client} = await setupApplication());

    wafapp.dataSource(testrest);
    wafapp.bind('datasources.config.AS3').to(testrest_config);
    setupRestServer(restPort);
  });

  after(async () => {
    await teardownApplication(wafapp);
    teardownRestServer();
  });

  it('verify rest server running ok', async () => {
    let hi = await httpGetAsync('http://localhost:' + restPort);
    expect(hi.statusCode).to.eql(200);
    expect(hi.read()).to.eql(Buffer.from('Hi'));
  });

  it('invokes GET ' + prefix + '/ping', async () => {
    const res = await client.get(prefix + '/ping').expect(200);
    expect(res.body).to.containEql({greeting: 'Hello from LoopBack'});
    expect(res.body.as3.version).to.eql('3.7.0');
  });
});
