import {DbDataSource} from '../../src/datasources';
import {expect} from '@loopback/testlab';
import {testdb_config} from '../fixtures/datasources/testdb.datasource';

describe('datasource function', () => {
  let dbsrc: DbDataSource;

  it('test DbDatasource with config', async () => {
    dbsrc = new DbDataSource(testdb_config);
    expect(dbsrc.name).to.be.eql('db');
  });

  it('test DbDatasource with no config', async () => {
    // let it go, and wait for ENOTFOUND. However it takes a little more time(~ 300 ms)
    dbsrc = new DbDataSource();
    expect(dbsrc.name).to.be.eql('db');
  });
});
