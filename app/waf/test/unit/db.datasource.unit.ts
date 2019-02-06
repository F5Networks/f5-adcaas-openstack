import {DbDataSource} from '../../src/datasources';
import {expect /*sinon*/} from '@loopback/testlab';
import {testdb_config} from '../fixtures/datasources/testdb.datasource';
//import {juggler} from '@loopback/service-proxy';
//import {ConnectorBase} from 'loopback-datasource-juggler';

describe('datasource function', () => {
  let dbsrc: DbDataSource;

  it('test DbDatasource with config', async () => {
    dbsrc = new DbDataSource(testdb_config);
    expect(dbsrc.name).to.be.eql('db');
  });

  // it('test DbDatasource with no config', async () => {
  //   // let it go, and wait for ENOTFOUND. However it takes a little more time(~ 300 ms)
  //   dbsrc = new DbDataSource();
  //   expect(dbsrc.name).to.be.eql('db');
  // });
});
