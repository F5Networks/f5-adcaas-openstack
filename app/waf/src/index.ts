import {WafApplication} from './application';
import {ApplicationConfig} from '@loopback/core';
import {probe} from 'network-utils-tcp-ping';
import {checkAndWait} from './utils';

export {WafApplication};

const prefix = '/adcaas/v1';

export async function main(options: ApplicationConfig = {}) {
  const app = new WafApplication(options);
  await app.boot();

  let dbReady = async () => {
    return probe(+process.env.DATABASE_PORT!, process.env.DATABASE_HOST, 1000);
  };
  await checkAndWait(dbReady, 3).then(async () => {
    await app.migrateSchema();
  });

  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}${prefix}/ping`);

  return app;
}
