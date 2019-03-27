import {RestApplication} from '@loopback/rest';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  givenHttpServerConfig,
  createRestAppClient,
  Client,
} from '@loopback/testlab';

export class MockBaseController {}

export enum RestApplicationPort {
  // in order, please.
  RestSelfTest = 2000,
  WafApp = 3000,
  IdentityUser = 5000,
  Nova = 8774,
  Neutron = 9696,
  IdentityAdmin = 35357,
}

export class MockRestApplication extends BootMixin(RestApplication) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // TODO: investigate what projectRoot be used for.
    this.projectRoot = __dirname;
  }
}

export async function setupRestAppAndClient(
  port: number,
  controllerCtor: typeof MockBaseController,
): Promise<RestAppAndClient> {
  const restApp = new MockRestApplication({
    rest: givenHttpServerConfig({
      port: port,
      host: 'localhost',
    }),
  });

  restApp.controller(controllerCtor);
  await restApp.boot();
  await restApp.start();

  const client = createRestAppClient(restApp);
  return {restApp: restApp, client: client};
}

export function teardownRestAppAndClient(app: MockRestApplication) {
  app.stop();
}

export interface RestAppAndClient {
  restApp: MockRestApplication;
  client: Client;
}
