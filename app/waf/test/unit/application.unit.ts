import {expect, sinon} from '@loopback/testlab';
import {WafApplication, main} from '../..';
import {testdb} from '../fixtures/datasources/testdb.datasource';
import {stubConsoleLog, restoreConsoleLog} from '../helpers/logging.helpers';

describe('WAFApplication main logic', () => {
  let app: WafApplication;

  before('stub WafApplication', async () => {
    sinon.stub(WafApplication.prototype, 'migrateSchema');
    sinon.stub(WafApplication.prototype, 'boot');
    sinon.stub(WafApplication.prototype, 'start');
    sinon.stub(WafApplication.prototype, 'stop');
  });

  after('restore WafApplication', async () => {
    sinon.restore();
  });

  it('invoke main without configuration', async () => {
    stubConsoleLog();
    app = await main();
    expect(app.options).to.eql({});
    restoreConsoleLog();
  });

  it('invoke main with a port number', async () => {
    stubConsoleLog();
    app = await main({port: 9999});
    expect(app.options).to.containEql({port: 9999});
    restoreConsoleLog();
  });
});

describe('WAFApplication constructor', () => {
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
