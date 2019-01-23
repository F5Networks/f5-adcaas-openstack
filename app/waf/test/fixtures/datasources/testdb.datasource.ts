import {juggler} from '@loopback/repository';

export const testdb_config = {
  name: 'db',
  connector: 'memory',
};
export const testdb: juggler.DataSource = new juggler.DataSource(testdb_config);
