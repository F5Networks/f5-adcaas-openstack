import {RestApplication} from '@loopback/rest';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  givenHttpServerConfig,
  createRestAppClient,
  Client,
} from '@loopback/testlab';
import {RepositoryMixin} from '@loopback/repository';
import {ServiceMixin} from '@loopback/service-proxy';
import {join} from 'path';

export class MockBaseController {
  constructor(...args: object[]) {}
}

export enum RestApplicationPort {
  // in order, please.
  RestSelfTest = 2000,
  WafApp = 3000,
  IdentityUser = 5000,
  Nova = 8774,
  Neutron = 9696,
  IdentityAdmin = 35357,
}

export class TestingApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // TODO: investigate what projectRoot be used for.
    //this.projectRoot = __dirname;
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
