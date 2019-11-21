/**
 * Copyright 2019 F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
import {stubLogger, restoreLogger} from './logging.helpers';
import {
  RestApplicationPort,
  Environments,
} from '../fixtures/datasources/testrest.datasource';
import {
  MockKeyStoneController,
  MockNovaController,
  MockNeutronController,
} from '../fixtures/controllers/mocks/mock.openstack.controller';
import {MockBigipController} from '../fixtures/controllers/mocks/mock.bigip.controller';
import {MockBigIqController} from '../fixtures/controllers/mocks/mock.bigiq.controller';
import {MockASGController} from '../fixtures/controllers/mocks/mock.asg.controller';

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
  proto?: 'https',
): Promise<RestAppAndClient> {
  let config: {[key: string]: string | number} = {
    port: port,
    host: 'localhost',
  };
  if (proto) config.protocol = proto;
  const restApp = new TestingApplication({
    rest: givenHttpServerConfig(config),
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

export async function teardownRestAppAndClient(app: TestingApplication) {
  await app.stop();
}

export interface RestAppAndClient {
  restApp: TestingApplication;
  client: Client;
}

export async function setupEnvs(addonEnvs: {[key: string]: string} = {}) {
  for (let k of Object.keys(Environments)) {
    process.env[k] = Environments[k];
  }
  for (let k of Object.keys(addonEnvs)) {
    process.env[k] = addonEnvs[k];
  }
}

export async function teardownEnvs() {
  for (let k of Object.keys(Environments)) {
    delete process.env[k];
  }
}

let mockKeystoneApp: TestingApplication;
let mockNovaApp: TestingApplication;
let mockNeutronApp: TestingApplication;
let mockBigipApp: TestingApplication;
let mockBigiqApp: TestingApplication;
let mockASGApp: TestingApplication;

export async function setupDepApps() {
  await Promise.all([
    setupRestAppAndClient(
      RestApplicationPort.IdentityAdmin,
      MockKeyStoneController,
    ),
    setupRestAppAndClient(RestApplicationPort.Nova, MockNovaController),
    setupRestAppAndClient(RestApplicationPort.Neutron, MockNeutronController),
    setupRestAppAndClient(
      RestApplicationPort.SSLCustom,
      MockBigipController,
      'https',
    ),
    setupRestAppAndClient(
      RestApplicationPort.BigIq,
      MockBigIqController,
      'https',
    ),
    setupRestAppAndClient(RestApplicationPort.ASG, MockASGController, 'https'),
  ]).then(([keystone, nova, neutron, bigip, bigiq, asg]) => {
    mockKeystoneApp = keystone.restApp;
    mockNovaApp = nova.restApp;
    mockNeutronApp = neutron.restApp;
    mockBigipApp = bigip.restApp;
    mockBigiqApp = bigiq.restApp;
    mockASGApp = asg.restApp;
  });
}

export async function teardownDepApps() {
  await Promise.all([
    teardownRestAppAndClient(mockBigipApp),
    teardownRestAppAndClient(mockBigiqApp),
    teardownRestAppAndClient(mockKeystoneApp),
    teardownRestAppAndClient(mockNovaApp),
    teardownRestAppAndClient(mockNeutronApp),
    teardownRestAppAndClient(mockASGApp),
  ]);
}
