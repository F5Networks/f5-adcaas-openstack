import {expect, sinon} from '@loopback/testlab';
import {WafApplication, main} from '../..';
import {testdb} from '../fixtures/datasources/testdb.datasource';

describe('WAF Application main function', () => {
  let app: WafApplication;

  before('stub WafApplication', async () => {
    sinon.stub(WafApplication.prototype, 'migrateSchema');
  });

  after('restore WafApplication', async () => {
    sinon.restore();
  });

  it('invoke main without configuration', async () => {
    app = await main();
    await app.stop();
  });

  it('invoke main with a port number', async () => {
    app = await main({port: 9999});
    expect(app.options).to.containEql({port: 9999});
    await app.stop();
  });
});

describe('WAF Application', () => {
  let app: WafApplication;

  it('construct app without parameter', async () => {
    app = new WafApplication();
    app.dataSource(testdb);
    await app.start();
    await app.stop();
  });

  it('construct app with a parameter', async () => {
    app = new WafApplication({});
    app.dataSource(testdb);
    await app.start();
    await app.stop();
  });
});
