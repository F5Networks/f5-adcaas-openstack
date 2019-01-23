import {WafApplication} from '../..';
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client,
} from '@loopback/testlab';
import {testdb_config, testdb} from '../fixtures/datasources/testdb.datasource';

export async function setupApplication(): Promise<AppWithClient> {
  const app = new WafApplication({
    rest: givenHttpServerConfig({
      host: 'localhost',
      port: 3000,
    }),
  });
  app.dataSource(testdb);

  await app.boot();
  app.bind('datasources.config.db').to(testdb_config);
  await app.start();

  const client = createRestAppClient(app);

  return {wafapp: app, client: client};
}

export interface AppWithClient {
  wafapp: WafApplication;
  client: Client;
}
