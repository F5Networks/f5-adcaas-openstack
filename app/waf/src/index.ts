import { WafApplication } from './application';
import { ApplicationConfig } from '@loopback/core';

export { WafApplication };

const prefix = '/adcaas/v1';

export async function main(options: ApplicationConfig = {}) {
  const app = new WafApplication(options);
  await app.boot();
  // Asynchronously perform the 'migrateSchema' action.
  // Delay the execution to make sure the dependent datasource is ready.
  setTimeout(async () => {
    await app.migrateSchema();
  }, 5000).unref();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}${prefix}/ping`);

  return app;
}
