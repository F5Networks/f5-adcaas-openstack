import {WafApplication} from '../..';
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client,
} from '@loopback/testlab';
import {testdb_config} from '../fixtures/datasources/testdb.datasource';
import {WafBindingKeys} from '../../src/keys';
import {BootMixin} from '@loopback/boot';
import {ServiceMixin} from '@loopback/service-proxy';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ApplicationConfig} from '@loopback/core';
import {join} from 'path';
import {MockBaseController} from '../fixtures/controllers/mocks/mock.base.controller';

export enum RestApplicationPort {
  // in order, please.
  RestSelfTest = 2000,
  WafApp = 3000,
  IdentityUser = 5000,
  Nova = 8774,
  Neutron = 9696,
  IdentityAdmin = 35357,
}
import {stubLogger, restoreLogger} from './logging.helpers';

export async function setupApplication(): Promise<AppWithClient> {
  const app = new WafApplication({
    rest: givenHttpServerConfig({
      host: 'localhost',
      port: RestApplicationPort.WafApp,
    }),
  });

  stubLogger();
  app.bind(WafBindingKeys.KeyDbConfig).to(testdb_config);

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {wafapp: app, client: client};
}

export async function teardownApplication(
  wafapp: WafApplication,
): Promise<void> {
  restoreLogger();
  return wafapp.stop();
}

export interface AppWithClient {
  wafapp: WafApplication;
  client: Client;
}

export class TestingApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.projectRoot = join(__dirname, '../../src');
  }
}

export async function setupRestAppAndClient(
  port: number,
  controllerCtor: typeof MockBaseController,
): Promise<RestAppAndClient> {
  const restApp = new TestingApplication({
    rest: givenHttpServerConfig({
      port: port,
      host: 'localhost',
    }),
  });

  restApp.controller(controllerCtor);

  restApp.bootOptions = {
    controllers: {
      dirs: ['notexists'],
    },
    repositories: {
      dirs: ['repositories'],
      extensions: ['.repository.js'],
      nested: true,
    },
  };

  await restApp.boot();
  await restApp.start();

  const client = createRestAppClient(restApp);
  return {restApp: restApp, client: client};
}

export function teardownRestAppAndClient(app: TestingApplication) {
  app.stop();
}

export interface RestAppAndClient {
  restApp: TestingApplication;
  client: Client;
}
