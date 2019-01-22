import {WafApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export {WafApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new WafApplication(options);
  await app.boot();
  await app.migrateSchema();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
