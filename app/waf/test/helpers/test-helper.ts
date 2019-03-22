import {WafApplication} from '../..';
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client,
} from '@loopback/testlab';
import {testdb_config} from '../fixtures/datasources/testdb.datasource';
import {stubLogging, restoreLogging} from './logging.helpers';

export async function setupApplication(): Promise<AppWithClient> {
  const app = new WafApplication({
    rest: givenHttpServerConfig({
      host: 'localhost',
      port: 3000,
    }),
  });

  stubLogging();
  // TODO: change all binding keys in code from string to BindingKey type.
  app.bind('datasources.config.db').to(testdb_config);

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {wafapp: app, client: client};
}

export async function teardownApplication(
  wafapp: WafApplication,
): Promise<void> {
  restoreLogging();
  return wafapp.stop();
}

export interface AppWithClient {
  wafapp: WafApplication;
  client: Client;
}
