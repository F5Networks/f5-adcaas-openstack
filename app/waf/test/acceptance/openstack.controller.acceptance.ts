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

import {
  TestingApplication,
  setupRestAppAndClient,
  teardownRestAppAndClient,
  setupDepApps,
  teardownDepApps,
} from '../helpers/testsetup-helper';
import {Client, expect} from '@loopback/testlab';
import {stubLogger, restoreLogger} from '../helpers/logging.helpers';
import {
  StubResponses,
  LetResponseWith,
} from '../fixtures/datasources/testrest.datasource';
import {OpenstackController} from '../fixtures/controllers/openstack.controller';
import {OpenStackComponent} from '../../src/components';
import {
  RestApplicationPort,
  ExpectedData,
} from '../fixtures/datasources/testrest.datasource';

describe('openstack.identity.test', () => {
  let testApp: TestingApplication;
  let client: Client;

  before('setup', async () => {
    await setupDepApps();
    let restAppAndClient = await setupRestAppAndClient(
      RestApplicationPort.WafApp,
      OpenstackController,
    );
    testApp = restAppAndClient.restApp;
    testApp.component(OpenStackComponent);
    client = restAppAndClient.client;

    stubLogger();
  });

  after('teardown', async () => {
    restoreLogger();
    teardownRestAppAndClient(testApp);
    await teardownDepApps();
  });

  it('identity v2 auth admin token: 200', async () => {
    LetResponseWith({keystone_post_v2_0_tokens: StubResponses.v2AuthToken200});

    let response = await client
      .get('/openstack/adminAuthToken')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v2.0',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {},
      })
      .expect(200);

    expect(response.body).containDeep({token: ExpectedData.userToken});
  });

  it('identity v2 auth admin token: 400 ', async () => {
    LetResponseWith({keystone_post_v2_0_tokens: StubResponses.response400});
    let response = await client
      .get('/openstack/adminAuthToken')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v2.0',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {},
      })
      .expect(200);

    expect(response.body).hasOwnProperty('message');
  });

  it('identity v2 auth admin token: 401', async () => {
    LetResponseWith({keystone_post_v2_0_tokens: StubResponses.response401});
    let response = await client
      .get('/openstack/adminAuthToken')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v2.0',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {},
      })
      .expect(200);

    expect(response.body).hasOwnProperty('message');
  });

  it('identity v3 auth admin token: 200', async () => {
    LetResponseWith({
      keystone_post_v3_auth_tokens: StubResponses.v3AuthToken200,
    });

    let response = await client
      .get('/openstack/adminAuthToken')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v3',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {},
      })
      .expect(200);

    expect(response.body.userId).eql(ExpectedData.userId);
    expect(response.body.token).eql(ExpectedData.userToken);
  });

  it('identity v3 auth admin token: 401', async () => {
    LetResponseWith({keystone_post_v3_auth_tokens: StubResponses.response401});

    let response = await client
      .get('/openstack/adminAuthToken')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v3',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {},
      })
      .expect(200);

    expect(response.body).hasOwnProperty('message');
  });

  it('identity v3 auth admin token: 400', async () => {
    LetResponseWith({keystone_post_v3_auth_tokens: StubResponses.response400});

    let response = await client
      .get('/openstack/adminAuthToken')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v3',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {},
      })
      .expect(200);

    expect(response.body).hasOwnProperty('message');
  });

  it('validate user token v2: 200', async () => {
    LetResponseWith({keystone_post_v2_0_tokens: StubResponses.v2AuthToken200});
    let response = await client
      .get('/openstack/validateUserToken')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v2.0',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {
          adminToken: '630daf7125a64d67b309e48603cbe461',
          userToken: '149bfc5ac96c442db50ced09cf075479',
          tenantName: '9f91a149-a847-41f9-96e2-2831c65948f4',
        },
      })
      .expect(200);

    expect(response.body.userId).eql(ExpectedData.userId);
  });

  it('validate user token v2: 401', async () => {
    LetResponseWith({keystone_post_v2_0_tokens: StubResponses.response401});
    let response = await client
      .get('/openstack/validateUserToken')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v2.0',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {
          adminToken: '630daf7125a64d67b309e48603cbe461',
          userToken: '149bfc5ac96c442db50ced09cf075479',
          tenantName: '9f91a149-a847-41f9-96e2-2831c65948f4',
        },
      })
      .expect(200);

    expect(response.body).hasOwnProperty('message');
  });

  it('validate user token v3: 200', async () => {
    LetResponseWith({
      keystone_post_v3_auth_tokens: StubResponses.v3AuthToken200,
    });
    let response = await client
      .get('/openstack/validateUserToken')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v3',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {
          adminToken: '630daf7125a64d67b309e48603cbe461',
          userToken: '149bfc5ac96c442db50ced09cf075479',
          tenantName: '9f91a149-a847-41f9-96e2-2831c65948f4',
        },
      })
      .expect(200);

    expect(response.body.token).eql(ExpectedData.userToken);
  });

  it('validate user token v3: 401', async () => {
    LetResponseWith({keystone_post_v3_auth_tokens: StubResponses.response401});
    let response = await client
      .get('/openstack/validateUserToken')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v3',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {
          adminToken: '630daf7125a64d67b309e48603cbe461',
          userToken: '149bfc5ac96c442db50ced09cf075479',
          tenantName: '9f91a149-a847-41f9-96e2-2831c65948f4',
        },
      })
      .expect(200);

    expect(response.body).hasOwnProperty('message');
  });

  it('validate user token Unknown version: failed', async () => {
    let response = await client
      .get('/openstack/validateUserToken')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/vUnkown',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {
          adminToken: '630daf7125a64d67b309e48603cbe461',
          userToken: '149bfc5ac96c442db50ced09cf075479',
          tenantName: '9f91a149-a847-41f9-96e2-2831c65948f4',
        },
      })
      .expect(200);

    expect(response.body).hasOwnProperty('message');
  });

  it('create vm with network id: 200', async () => {
    LetResponseWith({
      nova_post_v2_tenantId_servers: StubResponses.novaCreateVM200,
    });

    let response = await client
      .get('/openstack/createVirtualServer')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v2.0',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {
          userToken: '05380f3a-912b-46eb-8c8a-96c9658aad54',
          tenantId: '03930795-0898-46d7-acf5-df765fffe18c',
          networkId: '057c7f7b-d33d-4970-9464-1cd5be7ca52c',
          imageRef: '15788509-d8f4-4378-b414-821c437c2a9a',
          flavorRef: '1',
          securityGroupName: 'default',
          regionName: 'RegionOne',
          vmName: 'vm-{{vm-name-suffix}}',
        },
      })
      .expect(200);

    expect(response.body).to.containDeep({id: ExpectedData.serverId});
  });

  it('create vm with network id: 400', async () => {
    LetResponseWith({nova_post_v2_tenantId_servers: StubResponses.response400});

    let response = await client
      .get('/openstack/createVirtualServer')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v2.0',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {
          userToken: '05380f3a-912b-46eb-8c8a-96c9658aad54',
          tenantId: '03930795-0898-46d7-acf5-df765fffe18c',
          networkId: '057c7f7b-d33d-4970-9464-1cd5be7ca52c',
          imageRef: '15788509-d8f4-4378-b414-821c437c2a9a',
          flavorRef: '1',
          securityGroupName: 'default',
          regionName: 'RegionOne',
          vmName: 'vm-{{vm-name-suffix}}',
        },
      })
      .expect(200);

    expect(response.body).hasOwnProperty('message');
  });

  it('create vm with port id: 200', async () => {
    LetResponseWith({
      nova_post_v2_tenantId_servers: StubResponses.novaCreateVM200,
    });

    let response = await client
      .get('/openstack/createVirtualServer')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v2.0',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {
          userToken: '05380f3a-912b-46eb-8c8a-96c9658aad54',
          tenantId: '03930795-0898-46d7-acf5-df765fffe18c',
          imageRef: '15788509-d8f4-4378-b414-821c437c2a9a',
          flavorRef: '1',
          securityGroupName: 'default',
          regionName: 'RegionOne',
          vmName: 'vm-{{vm-name-suffix}}',
        },
      })
      .expect(200);

    expect(response.body).to.containDeep({id: ExpectedData.serverId});
  });

  it('create vm with port id: 401', async () => {
    LetResponseWith({nova_post_v2_tenantId_servers: StubResponses.response401});

    let response = await client
      .get('/openstack/createVirtualServer')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v2.0',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {
          userToken: '05380f3a-912b-46eb-8c8a-96c9658aad54',
          tenantId: '03930795-0898-46d7-acf5-df765fffe18c',
          imageRef: '15788509-d8f4-4378-b414-821c437c2a9a',
          flavorRef: '1',
          securityGroupName: 'default',
          regionName: 'RegionOne',
          vmName: 'vm-{{vm-name-suffix}}',
        },
      })
      .expect(200);

    expect(response.body).hasOwnProperty('message');
  });

  it('get vm detail: 200', async () => {
    LetResponseWith({
      nova_get_v2_tenantId_servers_serverId: StubResponses.novaGetVMDetail200,
    });

    let response = await client
      .get('/openstack/virtualServerDetail')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v2.0',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {
          userToken: '05380f3a-912b-46eb-8c8a-96c9658aad54',
          tenantId: '03930795-0898-46d7-acf5-df765fffe18c',
          serverId: '057c7f7b-d33d-4970-9464-1cd5be7ca52c',
          regionName: 'RegionOne',
        },
      })
      .expect(200);

    expect(response.body).containDeep({id: ExpectedData.serverId});
  });

  it('get vm detail: 200 with v3 identity', async () => {
    LetResponseWith({
      nova_get_v2_tenantId_servers_serverId: StubResponses.novaGetVMDetail200,
    });

    let response = await client
      .get('/openstack/virtualServerDetail')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v3',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {
          userToken: '05380f3a-912b-46eb-8c8a-96c9658aad54',
          tenantId: '03930795-0898-46d7-acf5-df765fffe18c',
          serverId: '057c7f7b-d33d-4970-9464-1cd5be7ca52c',
          regionName: 'RegionOne',
        },
      })
      .expect(200);

    expect(response.body).containDeep({id: ExpectedData.serverId});
  });

  it('get vm detail: 400', async () => {
    LetResponseWith({
      nova_get_v2_tenantId_servers_serverId: StubResponses.response400,
    });

    let response = await client
      .get('/openstack/virtualServerDetail')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v2.0',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {
          userToken: '05380f3a-912b-46eb-8c8a-96c9658aad54',
          tenantId: '03930795-0898-46d7-acf5-df765fffe18c',
          serverId: '057c7f7b-d33d-4970-9464-1cd5be7ca52c',
          regionName: 'RegionOne',
        },
      })
      .expect(200);

    expect(response.body).hasOwnProperty('message');
  });

  it('create a port: 200', async () => {
    LetResponseWith({
      neutron_post_v2_0_ports: StubResponses.neutronCreatePort200,
    });

    let response = await client
      .get('/openstack/createPort')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v2.0',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {
          networkId: ExpectedData.networks.management.networkId,
        },
      })
      .expect(200);

    expect(response.body).containDeep({
      id: ExpectedData.networks.management.portId,
    });
  });

  it('create a port: 400', async () => {
    LetResponseWith({neutron_post_v2_0_ports: StubResponses.response400});

    let response = await client
      .get('/openstack/createPort')
      .send({
        env: {
          OS_AUTH_URL: 'http://localhost:35357/v2.0',
          OS_USERNAME: 'wafaas',
          OS_PASSWORD: '91153c85b8dd4147',
          OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
          OS_DOMAIN_NAME: 'Default',
          OS_REGION_NAME: 'RegionOne',
          OS_AVAILABLE_ZONE: 'nova',
        },
        param: {},
      })
      .expect(200);

    expect(response.body).hasOwnProperty('message');
  });
});
