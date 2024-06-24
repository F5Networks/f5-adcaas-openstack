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

import {HttpErrors} from '@loopback/rest';

export enum RestApplicationPort {
  // in order, please.
  SSLDefault = 443,
  RestSelfTest = 2000,
  WafApp = 3000,
  IdentityUser = 5000,
  Onboarding = 8081,
  ASG = 8443,
  Nova = 8774,
  BigIq = 8888,
  Neutron = 9696,
  SSLCustom = 10443,
  IdentityAdmin = 35357,
}

export const Environments: {[key: string]: string} = {
  OS_AUTH_URL: 'http://localhost:35357/v2.0',
  OS_USERNAME: 'wafaas',
  OS_PASSWORD: '91153c85b8dd4147',
  OS_TENANT_ID: '32b8bef6100e4cb0a984a7c1f9027802',
  OS_DOMAIN_NAME: 'Default',
  OS_REGION_NAME: 'RegionOne',
  OS_INTERFACE: 'public',
  OS_AVAILABLE_ZONE: 'nova',
  OS_FLOATINGIP_NETWORK_ID: 'a33f84be-e058-482b-9efd-5cef248a6ca4',
  BIGIQ_HOST: '10.250.15.105',
  BIGIQ_USERNAME: 'admin',
  BIGIQ_PASSWORD: 'admin',
  BIGIQ_POOL: 'mykeypool',
  DO_RPM_PACKAGE: '/tmp/f5-declarative-onboarding-1.5.0-11.noarch.rpm',
  ASG_HOST: '127.0.0.1',
  ASG_PORT: `${RestApplicationPort.ASG}`,
  VE_RANDOM_PASS: 'true',
};

export const ExpectedData = {
  adcId: '3efa393d-eb7a-4ae8-8222-e4b99f14adcf',
  userToken: '8cf3d2447253455385c36254192cc4fe',
  userId: '2d26c96aa0f345eaafc3f5b50d2bbd8e',
  serverId: 'fef1e40c-ed9d-4e10-b10c-d60d3af70623',
  vmId: 'f250c956-bdd7-41cd-b3d5-03a79c7d90f8',
  tenantId: 'fdac59f5b20046829ea58720702a74af',
  bigipMgmt: {
    hostname: 'test-asm.example1234.openstack.com',
    tcpPort: RestApplicationPort.SSLCustom,
    licenseKey: 'JTSCD-MTSZS-MHVKG-YDMJY-XVSECOT',
  },
  networks: {
    management: {
      macAddr: 'fa:16:3e:96:da:69',
      ipAddr: '127.0.0.1',
      ipPoolCIDR: '127.0.0.1/24',
      networkId: '798b1b24-1bd5-481f-bda9-ec1e65cb4ab9',
      portId: 'c5b94732-fea2-405f-9c93-812510582360',
    },

    internal: {
      macAddr: 'fa:16:3e:57:41:05',
      ipAddr: '192.168.20.53',
      ipPoolCIDR: '192.168.20.1/24',
      networkId: '9859d600-b493-4d1f-bdff-2ec962ef2201',
      portId: '829f4795-109e-41ef-a987-09a470524e35',
    },
    ha: {
      macAddr: 'fa:16:3e:bf:91:b1',
      ipAddr: '192.168.30.52',
      ipPoolCIDR: '192.168.30.1/24',
      networkId: 'da3f7dbc-8bbf-4392-acc3-8b8544c2327c',
      portId: '34f9c718-eb02-4f38-a555-897ee4cab4cf',
    },
    external: {
      macAddr: 'fa:16:3e:13:c7:46',
      ipAddr: '192.168.10.21',
      ipPoolCIDR: '192.168.10.1/24',
      networkId: 'f82e85a4-79f6-4756-a25e-81f4e0506796',
      portId: 'a5a518a5-e4f1-4d53-9e4f-a91a9676273b',
      virtualAddress: '192.168.10.200',
    },
  },
  doTaskId: 'fe96c41e-6850-4210-bf3b-1902ad27dff4',
  declarationId: '3cc12f17-a6c7-4884-a119-98b456fe2020',
  memberId: '895cc33f_7af6_4477_adc4_c286908f0e72',
  applicationId: '1c19251d-7e97-411a-8816-6f7a72403707',
  trustDeviceId: '80e5aa54-ff6b-4717-9b53-6e8deafdebad',
  requestId: 'f488a7a2-bd74-42cb-8d6d-6b842efe24f7',
};

export const StubResponses = {
  response400: () => {
    throw new HttpErrors.Unauthorized(
      JSON.stringify({
        error: {
          message: 'Expecting to f.... e in error.',
          code: 400,
          title: 'Bad Request',
        },
      }),
    );
  },

  response401: () => {
    throw new HttpErrors.Unauthorized(
      JSON.stringify({
        error: {
          message: 'The request you have made requires authentication.',
          code: 401,
          title: 'Unauthorized',
        },
      }),
    );
  },

  response403: () => {
    throw new HttpErrors.Forbidden(
      JSON.stringify({
        forbidden: {
          message:
            'Quota exceeded for instances: Requested 1, but already used 10 of 10 instances',
          code: 403,
        },
      }),
    );
  },

  response404: () => {
    throw new HttpErrors.NotFound(
      JSON.stringify({
        itemNotFound: {
          message:
            'Instance da0f83c5-a2d1-4abe-b1d3-c8ae5b774534s could not be found.',
          code: 404,
        },
      }),
    );
  },

  emptyResponse: () => {
    return {};
  },

  v2AuthToken200: () => {
    return {
      access: {
        token: {
          issued_at: '2019-03-13T06:31:03.000000Z',
          expires: '2020-05-02T22:31:03Z',
          id: ExpectedData.userToken,
          tenant: {
            description: 'admin tenant',
            enabled: true,
            id: ExpectedData.tenantId,
            name: 'admin',
          },
          audit_ids: ['PGH3khYCThGlNngmcfVnTQ'],
        },
        serviceCatalog: [
          {
            endpoints: [
              {
                adminURL:
                  'http://localhost:8774/v2/fde45211da0a44ecbf38cb0b644ab30d',
                region: 'RegionOne',
                internalURL:
                  'http://localhost:8774/v2/fde45211da0a44ecbf38cb0b644ab30d',
                id: '43275deab0f043e0a02b49517fdce1fd',
                publicURL:
                  'http://localhost:8774/v2/fde45211da0a44ecbf38cb0b644ab30d',
              },
            ],
            endpoints_links: [],
            type: 'compute',
            name: 'nova',
          },
          {
            endpoints: [
              {
                adminURL: 'http://localhost:9696',
                region: 'RegionOne',
                internalURL: 'http://localhost:9696',
                id: '5a02ce706ba9428fa3c1056c95260f8b',
                publicURL: 'http://localhost:9696',
              },
            ],
            endpoints_links: [],
            type: 'network',
            name: 'neutron',
          },
          {
            endpoints: [
              {
                adminURL: 'http://localhost:8774/v3',
                region: 'RegionOne',
                internalURL: 'http://localhost:8774/v3',
                id: '2e731e724978457cb86457baba948789',
                publicURL: 'http://localhost:8774/v3',
              },
            ],
            endpoints_links: [],
            type: 'computev3',
            name: 'novav3',
          },
          {
            endpoints: [
              {
                adminURL: 'http://localhost:9292',
                region: 'RegionOne',
                internalURL: 'http://localhost:9292',
                id: '351173636a92491699361a9894017954',
                publicURL: 'http://localhost:9292',
              },
            ],
            endpoints_links: [],
            type: 'image',
            name: 'Image Service',
          },
          {
            endpoints: [
              {
                adminURL: 'http://localhost:9311',
                region: 'RegionOne',
                internalURL: 'http://localhost:9311',
                id: '5b07b7c63835447d9821f9a8610b3d86',
                publicURL: 'http://localhost:9311',
              },
            ],
            endpoints_links: [],
            type: 'key-manager',
            name: 'barbican',
          },
          {
            endpoints: [
              {
                adminURL: 'http://localhost:35357/v2.0',
                region: 'RegionOne',
                internalURL: 'http://localhost:5000/v2.0',
                id: '67cc91a7bc0842588bc934ff54c22846',
                publicURL: 'http://localhost:5000/v2.0',
              },
            ],
            endpoints_links: [],
            type: 'identity',
            name: 'keystone',
          },
        ],
        user: {
          username: 'admin',
          roles_links: [],
          id: '2d26c96aa0f345eaafc3f5b50d2bbd8e',
          roles: [
            {
              name: 'admin',
            },
          ],
          name: 'admin',
        },
        metadata: {
          is_admin: 0,
          roles: ['c98d2a4914664025991d28f0e827902f'],
        },
      },
    };
  },

  v3AuthToken200: () => {
    return {
      token: {
        methods: ['password'],
        roles: [
          {
            id: 'c98d2a4914664025991d28f0e827902f',
            name: 'admin',
          },
        ],
        expires_at: '2019-03-13T10:16:58.000000Z', // expired in 1 min.
        project: {
          domain: {
            id: 'default',
            name: 'Default',
          },
          id: ExpectedData.tenantId,
          name: 'admin',
        },
        catalog: [
          {
            endpoints: [
              {
                region_id: 'RegionOne',
                url: 'http://localhost:9292',
                region: 'RegionOne',
                interface: 'admin',
                id: '351173636a92491699361a9894017954',
              },
              {
                region_id: 'RegionOne',
                url: 'http://localhost:9292',
                region: 'RegionOne',
                interface: 'public',
                id: '7ae412ce62ab4c05a9bd5dc76deca46e',
              },
              {
                region_id: 'RegionOne',
                url: 'http://localhost:9292',
                region: 'RegionOne',
                interface: 'internal',
                id: 'e60ea61c20cf4d03a03aa34c08270146',
              },
            ],
            type: 'image',
            id: '2c348b43e94548a1ac8652c324f2cabf',
            name: 'Image Service',
          },
          {
            endpoints: [
              {
                region_id: 'RegionOne',
                url: 'http://localhost:9311',
                region: 'RegionOne',
                interface: 'admin',
                id: '5b07b7c63835447d9821f9a8610b3d86',
              },
              {
                region_id: 'RegionOne',
                url: 'http://localhost:9311',
                region: 'RegionOne',
                interface: 'internal',
                id: '738d3a2fc62e4d958929c5879b965614',
              },
              {
                region_id: 'RegionOne',
                url: 'http://localhost:9311',
                region: 'RegionOne',
                interface: 'public',
                id: 'b49ee322b147431fad88e06e0e903412',
              },
            ],
            type: 'key-manager',
            id: '2e9775eb13924c64aa67fbfd213775bc',
            name: 'barbican',
          },
          {
            endpoints: [
              {
                region_id: 'RegionOne',
                url: 'http://localhost:35357/v2.0',
                region: 'RegionOne',
                interface: 'admin',
                id: '67cc91a7bc0842588bc934ff54c22846',
              },
              {
                region_id: 'RegionOne',
                url: 'http://localhost:5000/v2.0',
                region: 'RegionOne',
                interface: 'public',
                id: 'd219ddf34dda4b5e9c0f2c3c572d9def',
              },
              {
                region_id: 'RegionOne',
                url: 'http://localhost:5000/v2.0',
                region: 'RegionOne',
                interface: 'internal',
                id: 'f84f401b1e2d462b8bdb416e4e24c90a',
              },
            ],
            type: 'identity',
            id: '2f75e3e8e08c4fb297ed0b0704e30858',
            name: 'keystone',
          },
          {
            endpoints: [
              {
                region_id: 'RegionOne',
                url:
                  'http://localhost:8774/v2/fde45211da0a44ecbf38cb0b644ab30d',
                region: 'RegionOne',
                interface: 'internal',
                id: '43275deab0f043e0a02b49517fdce1fd',
              },
              {
                region_id: 'RegionOne',
                url:
                  'http://localhost:8774/v2/fde45211da0a44ecbf38cb0b644ab30d',
                region: 'RegionOne',
                interface: 'admin',
                id: '901e5640d926405e8a45d213ec6580fd',
              },
              {
                region_id: 'RegionOne',
                url:
                  'http://localhost:8774/v2/fde45211da0a44ecbf38cb0b644ab30d',
                region: 'RegionOne',
                interface: 'public',
                id: 'c776745dbad64475a020e219b636894d',
              },
            ],
            type: 'compute',
            id: '4444a4a5c17a4912b95fcf2f84034059',
            name: 'nova',
          },
          {
            endpoints: [
              {
                region_id: 'RegionOne',
                url: 'http://localhost:8774/v3',
                region: 'RegionOne',
                interface: 'public',
                id: '2e731e724978457cb86457baba948789',
              },
              {
                region_id: 'RegionOne',
                url: 'http://localhost:8774/v3',
                region: 'RegionOne',
                interface: 'admin',
                id: '48f8a773a40b4bdeaa85edf41464175e',
              },
              {
                region_id: 'RegionOne',
                url: 'http://localhost:8774/v3',
                region: 'RegionOne',
                interface: 'internal',
                id: 'e5352a8c8aa9425ca3c75b5d9ad32156',
              },
            ],
            type: 'computev3',
            id: '8fed3c480b184ee6a0c8250372c3f6bf',
            name: 'novav3',
          },
          {
            endpoints: [
              {
                region_id: 'RegionOne',
                url: 'http://localhost:9696',
                region: 'RegionOne',
                interface: 'public',
                id: '5a02ce706ba9428fa3c1056c95260f8b',
              },
              {
                region_id: 'RegionOne',
                url: 'http://localhost:9696',
                region: 'RegionOne',
                interface: 'admin',
                id: '5fa4669b03da4e8081289c1c119e678e',
              },
              {
                region_id: 'RegionOne',
                url: 'http://localhost:9696',
                region: 'RegionOne',
                interface: 'internal',
                id: 'e0fe35ed923f4c719637d7c104dd3687',
              },
            ],
            type: 'network',
            id: 'ebf0ace7c2b0477ea2fb27c25f3d04a0',
            name: 'neutron',
          },
        ],
        user: {
          domain: {
            id: 'default',
            name: 'Default',
          },
          id: ExpectedData.userId,
          name: 'admin',
        },
        audit_ids: ['FIddBgDDQUKTwLMRjRxswA'],
        issued_at: '2019-03-13T10:15:58.000000Z',
      },
    };
  },

  novaCreateVM200: () => {
    return {
      server: {
        security_groups: [
          {
            name: 'default',
          },
        ],
        'OS-DCF:diskConfig': 'AUTO',
        id: ExpectedData.serverId,
        links: [
          {
            href:
              'http://localhost:8774/v2/ef9fd3e3df664e558f043bd24c1fca21/servers/bbed9da3-ca5f-46b8-b945-01047a21edea',
            rel: 'self',
          },
          {
            href:
              'http://localhost:8774/ef9fd3e3df664e558f043bd24c1fca21/servers/bbed9da3-ca5f-46b8-b945-01047a21edea',
            rel: 'bookmark',
          },
        ],
        adminPass: 'ka5J4qZAbSUA',
      },
    };
  },

  novaDeleteVM200: () => {},

  novaGetVMDetail200: () => {
    return {
      server: {
        'OS-EXT-STS:task_state': null,
        addresses: {
          f5_test_net: [
            {
              'OS-EXT-IPS-MAC:mac_addr': 'fa:16:3e:53:96:a7',
              version: 4,
              addr: '10.1.1.9',
              'OS-EXT-IPS:type': 'fixed',
            },
          ],
        },
        links: [
          {
            href:
              'http://localhost:8774/v2/ef9fd3e3df664e558f043bd24c1fca21/servers/da0f83c5-a2d1-4abe-b1d3-c8ae5b774534',
            rel: 'self',
          },
          {
            href:
              'http://localhost:8774/ef9fd3e3df664e558f043bd24c1fca21/servers/da0f83c5-a2d1-4abe-b1d3-c8ae5b774534',
            rel: 'bookmark',
          },
        ],
        image: {
          id: '646fa39c-0a51-45d5-a1e7-3d401bd1a284',
          links: [
            {
              href:
                'http://localhost:8774/ef9fd3e3df664e558f043bd24c1fca21/images/646fa39c-0a51-45d5-a1e7-3d401bd1a284',
              rel: 'bookmark',
            },
          ],
        },
        'OS-EXT-STS:vm_state': 'active',
        'OS-EXT-SRV-ATTR:instance_name': 'instance-00000008',
        'OS-SRV-USG:launched_at': '2019-03-14T01:32:02.000000',
        flavor: {
          id: '1',
          links: [
            {
              href:
                'http://localhost:8774/ef9fd3e3df664e558f043bd24c1fca21/flavors/1',
              rel: 'bookmark',
            },
          ],
        },
        id: ExpectedData.serverId,
        security_groups: [
          {
            name: 'default',
          },
        ],
        user_id: '4d8d505a3c8e4d5bad9431878dcb9f4e',
        'OS-DCF:diskConfig': 'AUTO',
        accessIPv4: '',
        accessIPv6: '',
        progress: 0,
        'OS-EXT-STS:power_state': 1,
        'OS-EXT-AZ:availability_zone': 'nova',
        metadata: {},
        status: 'ACTIVE',
        updated: '2019-03-14T01:32:02Z',
        hostId: 'c06ef6ce91ceb3f9e01e48560c8906c1b3b82e03185466ea23d70413',
        'OS-EXT-SRV-ATTR:host': 'rdo-rhel-mitaka-2.novalocal',
        'OS-SRV-USG:terminated_at': null,
        key_name: null,
        'OS-EXT-SRV-ATTR:hypervisor_hostname': 'rdo-rhel-mitaka-2.novalocal',
        name: 'vm-9540',
        created: '2019-03-14T01:31:59Z',
        tenant_id: 'ef9fd3e3df664e558f043bd24c1fca21',
        'os-extended-volumes:volumes_attached': [],
        config_drive: '',
      },
    };
  },

  neutronCreatePort200: (networkId: string) => {
    if (networkId === ExpectedData.networks.management.networkId) {
      return {
        port: {
          allowed_address_pairs: [],
          extra_dhcp_opts: [],
          updated_at: '2019-07-05T14:54:27Z',
          device_owner: '',
          revision_number: 6,
          'binding:profile': {},
          port_security_enabled: true,
          fixed_ips: [
            {
              subnet_id: '23863fb0-9709-4808-87b5-0d3411d63a9a',
              ip_address: ExpectedData.networks.management.ipAddr,
            },
          ],
          id: ExpectedData.networks.management.portId,
          security_groups: ['0c2a32a5-2472-46c8-93b0-2e7d84e83afd'],
          'binding:vif_details': {},
          'binding:vif_type': 'unbound',
          mac_address: ExpectedData.networks.management.macAddr,
          project_id: '610be7617fff469c88b71301cffd4c06',
          status: 'DOWN',
          'binding:host_id': '',
          description: '',
          tags: [],
          device_id: '',
          name: 'port-name-8547144',
          admin_state_up: true,
          network_id: ExpectedData.networks.management.networkId,
          tenant_id: '610be7617fff469c88b71301cffd4c06',
          created_at: '2019-07-05T14:54:27Z',
          'binding:vnic_type': 'normal',
        },
      };
    } else if (networkId === ExpectedData.networks.internal.networkId) {
      return {
        port: {
          allowed_address_pairs: [],
          extra_dhcp_opts: [],
          updated_at: '2019-07-05T15:02:47Z',
          device_owner: '',
          revision_number: 6,
          'binding:profile': {},
          port_security_enabled: true,
          fixed_ips: [
            {
              subnet_id: 'b3755d06-6e24-4d9b-aa05-918e53d3a6d1',
              ip_address: ExpectedData.networks.internal.ipAddr,
            },
          ],
          id: ExpectedData.networks.internal.portId,
          security_groups: ['0c2a32a5-2472-46c8-93b0-2e7d84e83afd'],
          'binding:vif_details': {},
          'binding:vif_type': 'unbound',
          mac_address: ExpectedData.networks.internal.macAddr,
          project_id: '610be7617fff469c88b71301cffd4c06',
          status: 'DOWN',
          'binding:host_id': '',
          description: '',
          tags: [],
          device_id: '',
          name: '',
          admin_state_up: true,
          network_id: ExpectedData.networks.internal.networkId,
          tenant_id: '610be7617fff469c88b71301cffd4c06',
          created_at: '2019-07-05T15:02:47Z',
          'binding:vnic_type': 'normal',
        },
      };
    } else if (networkId === ExpectedData.networks.ha.networkId) {
      return {
        port: {
          allowed_address_pairs: [],
          extra_dhcp_opts: [],
          updated_at: '2019-07-05T15:01:59Z',
          device_owner: '',
          revision_number: 6,
          'binding:profile': {},
          port_security_enabled: true,
          fixed_ips: [
            {
              subnet_id: '0b8eccd9-edb6-4e58-aa48-bbbd94e47616',
              ip_address: ExpectedData.networks.ha.ipAddr,
            },
          ],
          id: ExpectedData.networks.ha.portId,
          security_groups: ['0c2a32a5-2472-46c8-93b0-2e7d84e83afd'],
          'binding:vif_details': {},
          'binding:vif_type': 'unbound',
          mac_address: ExpectedData.networks.ha.macAddr,
          project_id: '610be7617fff469c88b71301cffd4c06',
          status: 'DOWN',
          'binding:host_id': '',
          description: '',
          tags: [],
          device_id: '',
          name: '',
          admin_state_up: true,
          network_id: ExpectedData.networks.ha.networkId,
          tenant_id: '610be7617fff469c88b71301cffd4c06',
          created_at: '2019-07-05T15:01:58Z',
          'binding:vnic_type': 'normal',
        },
      };
    } else if (networkId === ExpectedData.networks.external.networkId) {
      return {
        port: {
          allowed_address_pairs: [],
          extra_dhcp_opts: [],
          updated_at: '2019-07-05T15:01:20Z',
          device_owner: '',
          revision_number: 6,
          'binding:profile': {},
          port_security_enabled: true,
          fixed_ips: [
            {
              subnet_id: '7be5c927-0df8-433b-b5f3-f0ad159c0413',
              ip_address: ExpectedData.networks.external.ipAddr,
            },
          ],
          id: ExpectedData.networks.external.portId,
          security_groups: ['0c2a32a5-2472-46c8-93b0-2e7d84e83afd'],
          'binding:vif_details': {},
          'binding:vif_type': 'unbound',
          mac_address: ExpectedData.networks.external.macAddr,
          project_id: '610be7617fff469c88b71301cffd4c06',
          status: 'DOWN',
          'binding:host_id': '',
          description: '',
          tags: [],
          device_id: '',
          name: '',
          admin_state_up: true,
          network_id: ExpectedData.networks.external.networkId,
          tenant_id: '610be7617fff469c88b71301cffd4c06',
          created_at: '2019-07-05T15:01:20Z',
          'binding:vnic_type': 'normal',
        },
      };
    }
  },

  neutronUpdatePort200: () => {
    return {
      port: {
        allowed_address_pairs: [],
        extra_dhcp_opts: [],
        updated_at: '2019-06-14T03:54:35Z',
        device_owner: 'compute:nova',
        revision_number: 10,
        'binding:profile': {},
        port_security_enabled: false,
        fixed_ips: [
          {
            subnet_id: 'c20e13cb-ebce-414f-8319-43cc30476aea',
            ip_address: '10.250.41.46',
          },
          {
            subnet_id: 'c20e13cb-ebce-414f-8319-43cc30476aea',
            ip_address: '10.250.41.56',
          },
        ],
        id: 'cfa3f632-41c4-4683-8a21-5438c76d2fa8',
        security_groups: ['da974cc7-febd-479b-9452-20c7894f7c79'],
        'binding:vif_details': {
          port_filter: true,
          datapath_type: 'system',
          ovs_hybrid_plug: true,
        },
        'binding:vif_type': 'ovs',
        mac_address: 'fa:16:3e:91:93:6e',
        project_id: 'ebce159403624ae38376161574130473',
        status: 'ACTIVE',
        'binding:host_id': 'overcloud-compute-1.localdomain',
        description: '',
        tags: [],
        qos_policy_id: null,
        name: 'f5-14d3de1c-b73b-48ce-886f-619999d2cea8-ext-external2',
        admin_state_up: true,
        network_id: '9bdbf55c-678a-4549-b0d6-fadf58b3a3ec',
        tenant_id: 'ebce159403624ae38376161574130473',
        created_at: '2019-06-14T01:06:29Z',
        'binding:vnic_type': 'normal',
        device_id: '0956d723-344b-4efa-b15f-9721751755f4',
      },
    };
  },

  neutronGetPort200: () => {
    return {
      port: {
        allowed_address_pairs: [],
        extra_dhcp_opts: [],
        updated_at: '2019-06-14T03:54:35Z',
        device_owner: 'compute:nova',
        revision_number: 10,
        'binding:profile': {},
        port_security_enabled: false,
        fixed_ips: [
          {
            subnet_id: 'c20e13cb-ebce-414f-8319-43cc30476aea',
            ip_address: '10.250.41.46',
          },
          {
            subnet_id: 'c20e13cb-ebce-414f-8319-43cc30476aea',
            ip_address: '10.250.41.56',
          },
        ],
        id: 'cfa3f632-41c4-4683-8a21-5438c76d2fa8',
        security_groups: ['da974cc7-febd-479b-9452-20c7894f7c79'],
        'binding:vif_details': {
          port_filter: true,
          datapath_type: 'system',
          ovs_hybrid_plug: true,
        },
        'binding:vif_type': 'ovs',
        mac_address: 'fa:16:3e:91:93:6e',
        project_id: 'ebce159403624ae38376161574130473',
        status: 'ACTIVE',
        'binding:host_id': 'overcloud-compute-1.localdomain',
        description: '',
        tags: [],
        qos_policy_id: null,
        name: 'f5-14d3de1c-b73b-48ce-886f-619999d2cea8-ext-external2',
        admin_state_up: true,
        network_id: '9bdbf55c-678a-4549-b0d6-fadf58b3a3ec',
        tenant_id: 'ebce159403624ae38376161574130473',
        created_at: '2019-06-14T01:06:29Z',
        'binding:vnic_type': 'normal',
        device_id: '0956d723-344b-4efa-b15f-9721751755f4',
      },
    };
  },

  neutronDeletePort200: () => {},

  neutronGetSubnets200: (networkId: string) => {
    if (networkId === ExpectedData.networks.management.networkId) {
      return {
        subnets: [
          {
            service_types: [],
            description: '',
            enable_dhcp: true,
            tags: [],
            network_id: ExpectedData.networks.management.networkId,
            tenant_id: '610be7617fff469c88b71301cffd4c06',
            created_at: '2019-06-20T07:37:13Z',
            dns_nameservers: ['8.8.8.8'],
            updated_at: '2019-06-20T08:47:56Z',
            ipv6_ra_mode: null,
            allocation_pools: [
              {
                start: '127.0.0.1',
                end: '127.0.0.255',
              },
            ],
            gateway_ip: '127.0.0.2',
            revision_number: 1,
            ipv6_address_mode: null,
            ip_version: 4,
            host_routes: [],
            cidr: ExpectedData.networks.management.ipPoolCIDR,
            project_id: '610be7617fff469c88b71301cffd4c06',
            id: '23863fb0-9709-4808-87b5-0d3411d63a9a',
            subnetpool_id: null,
            name: '127.0.0.1/24',
          },
        ],
      };
    } else if (networkId === ExpectedData.networks.internal.networkId) {
      return {
        subnets: [
          {
            service_types: [],
            description: '',
            enable_dhcp: true,
            tags: [],
            network_id: ExpectedData.networks.internal.networkId,
            tenant_id: '610be7617fff469c88b71301cffd4c06',
            created_at: '2019-06-24T01:22:08Z',
            dns_nameservers: [],
            updated_at: '2019-06-24T01:22:08Z',
            ipv6_ra_mode: null,
            allocation_pools: [
              {
                start: '192.168.20.2',
                end: '192.168.20.254',
              },
            ],
            gateway_ip: '192.168.20.1',
            revision_number: 0,
            ipv6_address_mode: null,
            ip_version: 4,
            host_routes: [],
            cidr: ExpectedData.networks.internal.ipPoolCIDR,
            project_id: '610be7617fff469c88b71301cffd4c06',
            id: 'b3755d06-6e24-4d9b-aa05-918e53d3a6d1',
            subnetpool_id: null,
            name: 'f5-int-sub',
          },
        ],
      };
    } else if (networkId === ExpectedData.networks.ha.networkId) {
      return {
        subnets: [
          {
            service_types: [],
            description: '',
            enable_dhcp: true,
            tags: [],
            network_id: ExpectedData.networks.ha.networkId,
            tenant_id: '610be7617fff469c88b71301cffd4c06',
            created_at: '2019-06-24T01:22:29Z',
            dns_nameservers: [],
            updated_at: '2019-06-24T01:22:29Z',
            ipv6_ra_mode: null,
            allocation_pools: [
              {
                start: '192.168.30.2',
                end: '192.168.30.254',
              },
            ],
            gateway_ip: '192.168.30.1',
            revision_number: 0,
            ipv6_address_mode: null,
            ip_version: 4,
            host_routes: [],
            cidr: ExpectedData.networks.ha.ipPoolCIDR,
            project_id: '610be7617fff469c88b71301cffd4c06',
            id: '0b8eccd9-edb6-4e58-aa48-bbbd94e47616',
            subnetpool_id: null,
            name: 'f5-ha-sub',
          },
        ],
      };
    } else if (networkId === ExpectedData.networks.external.networkId) {
      return {
        subnets: [
          {
            service_types: [],
            description: '',
            enable_dhcp: true,
            tags: [],
            network_id: ExpectedData.networks.external.networkId,
            tenant_id: '610be7617fff469c88b71301cffd4c06',
            created_at: '2019-06-24T01:21:44Z',
            dns_nameservers: [],
            updated_at: '2019-06-24T01:21:44Z',
            ipv6_ra_mode: null,
            allocation_pools: [
              {
                start: '192.168.10.2',
                end: '192.168.10.254',
              },
            ],
            gateway_ip: '192.168.10.1',
            revision_number: 0,
            ipv6_address_mode: null,
            ip_version: 4,
            host_routes: [],
            cidr: ExpectedData.networks.external.ipPoolCIDR,
            project_id: '610be7617fff469c88b71301cffd4c06',
            id: '7be5c927-0df8-433b-b5f3-f0ad159c0413',
            subnetpool_id: null,
            name: 'f5-ex-subnet',
          },
        ],
      };
    }
  },

  neutronIpAddressAlreadyAllocated409: () => {
    //   {
    //     "NeutronError": {
    //         "message": "IP address 10.250.14.112 already allocated in subnet 9519c0c5-0c09-48ee-89a1-90ff7bb8fd9c",
    //         "type": "IpAddressAlreadyAllocated",
    //         "detail": ""
    //     }
    // }
    throw new HttpErrors.Conflict(
      'IP address 10.250.14.112 already allocated in subnet 9519c0c5-0c09-48ee-89a1-90ff7bb8fd9c',
    );
  },

  neutronExternalGatewayForFloatingIPNotFound404: () => {
    //   {
    //     "NeutronError": {
    //         "message": "External network a33f84be-e058-482b-9efd-5cef248a6ca4 is not reachable from subnet 23863fb0-9709-4808-87b5-0d3411d63a9a.  Therefore, cannot associate Port 5dbfc746-6617-427f-a848-b94084754094 with a Floating IP.",
    //         "type": "ExternalGatewayForFloatingIPNotFound",
    //         "detail": ""
    //     }
    // }

    throw new HttpErrors.NotFound(
      'External network a33f84be-e058-482b-9efd-5cef248a6ca4 is not reachable from subnet 23863fb0-9709-4808-87b5-0d3411d63a9a.  Therefore, cannot associate Port 5dbfc746-6617-427f-a848-b94084754094 with a Floating IP.',
    );
  },

  neutronPutFloatingIp200: () => {
    return {
      floatingip: {
        router_id: '66787d19-a76d-4543-8694-03f86e64500e',
        status: 'DOWN',
        description: '',
        tags: [],
        tenant_id: '610be7617fff469c88b71301cffd4c06',
        created_at: '2019-06-23T08:41:54Z',
        updated_at: '2019-06-23T08:54:15Z',
        floating_network_id: 'a33f84be-e058-482b-9efd-5cef248a6ca4',
        fixed_ip_address: '192.168.1.101',
        floating_ip_address: '10.250.14.110',
        revision_number: 1,
        project_id: '610be7617fff469c88b71301cffd4c06',
        port_id: 'f18a9989-c5f4-4337-9aeb-53aa78e9d99a',
        id: 'ec0a314f-657e-4755-b321-2cdc13cd7eef',
      },
    };
  },

  neutronPostFloatingIp201: () => {
    return {
      floatingip: {
        router_id: null,
        status: 'DOWN',
        description: '',
        tags: [],
        tenant_id: '610be7617fff469c88b71301cffd4c06',
        created_at: '2019-06-23T08:41:54Z',
        updated_at: '2019-06-23T08:41:54Z',
        floating_network_id: 'a33f84be-e058-482b-9efd-5cef248a6ca4',
        fixed_ip_address: null,
        floating_ip_address: '10.250.14.110',
        revision_number: 0,
        project_id: '610be7617fff469c88b71301cffd4c06',
        port_id: null,
        id: 'ec0a314f-657e-4755-b321-2cdc13cd7eef',
      },
    };
  },

  neutronGetFloatingIps200: () => {
    return {
      floatingips: [
        {
          router_id: null,
          status: 'DOWN',
          description: '',
          tags: [],
          tenant_id: '610be7617fff469c88b71301cffd4c06',
          created_at: '2019-06-21T08:32:29Z',
          updated_at: '2019-06-21T08:32:29Z',
          floating_network_id: 'a33f84be-e058-482b-9efd-5cef248a6ca4',
          fixed_ip_address: null,
          floating_ip_address: '10.250.14.112',
          revision_number: 0,
          project_id: '610be7617fff469c88b71301cffd4c06',
          port_id: null,
          id: 'bcda6252-ce92-4b18-a903-ab681bb935aa',
        },
      ],
    };
  },

  neutronGetFloatingIpsStateActive200: () => {
    return {
      floatingips: [
        {
          router_id: null,
          status: 'ACTIVE',
          description: '',
          tags: [],
          tenant_id: '610be7617fff469c88b71301cffd4c06',
          created_at: '2019-06-21T08:32:29Z',
          updated_at: '2019-06-21T08:32:29Z',
          floating_network_id: 'a33f84be-e058-482b-9efd-5cef248a6ca4',
          fixed_ip_address: null,
          floating_ip_address: '10.250.14.112',
          revision_number: 0,
          project_id: '610be7617fff469c88b71301cffd4c06',
          port_id: null,
          id: 'bcda6252-ce92-4b18-a903-ab681bb935aa',
        },
      ],
    };
  },

  neutronGetFloatingIpsEmpty200: () => {
    return {
      floatingips: [],
    };
  },

  neutronDeleteFloatingIp204: () => {},

  bigipNoLicense200: () => {
    return {
      kind: 'tm:sys:license:licensestats',
      selfLink: 'https://localhost/mgmt/tm/sys/license?ver=13.1.1',
      apiRawValues: {
        apiAnonymous: "Can't load license, may not be operational\n",
      },
    };
  },

  bigipInstallLicenseKey200: () => {
    return {
      status: 'LICENSING_ACTIVATION_IN_PROGRESS',
      generation: 1,
      lastUpdateMicros: 1574069753265791,
      kind: 'tm:shared:licensing:activation:activatelicenseresponse',
      selfLink: 'https://localhost/mgmt/tm/shared/licensing/activation',
    };
  },

  bigipInstallLicenseText200: () => {
    return {};
  },

  bigipLiense200: () => {
    return {
      entries: {
        'https://localhost/mgmt/tm/sys/license/0': {
          nestedStats: {
            entries: {
              'https://localhost/mgmt/tm/sys/license/0/active-modules': {
                nestedStats: {
                  entries: {
                    'https://localhost/mgmt/tm/sys/license/0/active-modules/%22APM,%20Base,%20VE%20GBB%20(500%20CCU,%202500%20Access%20Sessions)%22': {
                      nestedStats: {
                        entries: {
                          featureModules: {
                            description:
                              '{ "Anti-Virus Checks" "Base Endpoint Security Checks" "Firewall Checks" "Network Access" "Secure Virtual Keyboard" "APM, Web Application" "Machine Certificate Checks" "Protected Workspace" "Remote Desktop" "App Tunnel" }',
                          },
                          key: {
                            description: 'EQUYKXX-AOPHOGH',
                          },
                        },
                      },
                    },
                    'https://localhost/mgmt/tm/sys/license/0/active-modules/%22Best%20Bundle,%20VE-25M%22': {
                      nestedStats: {
                        entries: {
                          featureModules: {
                            description:
                              '{ "Rate Shaping" "Routing Bundle, VE" "ASM, VE" "DNS-GTM, Base, 25M" "SSL, VE" "Max Compression, VE" "AFM, VE" "DNSSEC" "PSM, VE" "VE, Carrier Grade NAT (AFM ONLY)" }',
                          },
                          key: {
                            description: 'FXKFKXF-QWEDEWW',
                          },
                        },
                      },
                    },
                  },
                },
              },
              licenseEndDate: {
                description: '2019/06/22',
              },
              licenseStartDate: {
                description: '2019/05/06',
              },
              licensedOnDate: {
                description: '2019/05/07',
              },
              licensedVersion: {
                description: '6.1.0',
              },
              platformId: {
                description: 'Z100',
              },
              registrationKey: {
                description: ExpectedData.bigipMgmt.licenseKey,
              },
              serviceCheckDate: {
                description: '2019/05/04',
              },
            },
          },
        },
      },
      kind: 'tm:sys:license:licensestats',
      selfLink: 'https://localhost/mgmt/tm/sys/license?ver=13.1.1',
    };
  },

  bigipCmDeviceNone200: () => {
    return {
      kind: 'tm:cm:device:devicecollectionstate',
      selfLink: 'https://localhost/mgmt/tm/cm/device?ver=13.1.1',
      items: [
        {
          kind: 'tm:cm:device:devicestate',
          name: 'bigip1',
          partition: 'Common',
          fullPath: '/Common/bigip1',
          generation: 8,
          selfLink:
            'https://localhost/mgmt/tm/cm/device/~Common~bigip1?ver=13.1.1',
          baseMac: 'fa:16:3e:2d:e4:dd',
          build: '0.0.4',
          cert: '/Common/dtdi.crt',
          certReference: {
            link:
              'https://localhost/mgmt/tm/cm/cert/~Common~dtdi.crt?ver=13.1.1',
          },
          chassisId: 'c12d30e9-dd5b-b744-4b2259ca2808',
          chassisType: 'individual',
          configsyncIp: 'none',
          edition: 'Final',
          failoverState: 'active',
          haCapacity: 0,
          hostname: 'host-10-250-15-133.openstacklocal',
          key: '/Common/dtdi.key',
          keyReference: {
            link:
              'https://localhost/mgmt/tm/cm/key/~Common~dtdi.key?ver=13.1.1',
          },
          managementIp: ExpectedData.networks.management.ipAddr,
          marketingName: 'BIG-IP Virtual Edition',
          mirrorIp: 'any6',
          mirrorSecondaryIp: 'any6',
          multicastIp: 'any6',
          multicastPort: 0,
          platformId: 'Z100',
          product: 'BIG-IP',
          selfDevice: 'true',
          timeZone: 'America/Los_Angeles',
          version: '13.1.1',
        },
      ],
    };
  },

  bigipCmDevice200: () => {
    return {
      kind: 'tm:cm:device:devicecollectionstate',
      selfLink: 'https://localhost/mgmt/tm/cm/device?ver=13.1.1',
      items: [
        {
          kind: 'tm:cm:device:devicestate',
          name: 'bigip1',
          partition: 'Common',
          fullPath: '/Common/bigip1',
          generation: 8,
          selfLink:
            'https://localhost/mgmt/tm/cm/device/~Common~bigip1?ver=13.1.1',
          baseMac: 'fa:16:3e:2d:e4:dd',
          build: '0.0.4',
          cert: '/Common/dtdi.crt',
          certReference: {
            link:
              'https://localhost/mgmt/tm/cm/cert/~Common~dtdi.crt?ver=13.1.1',
          },
          chassisId: 'c12d30e9-dd5b-b744-4b2259ca2808',
          chassisType: 'individual',
          configsyncIp: ExpectedData.networks.ha.ipAddr,
          edition: 'Final',
          failoverState: 'active',
          haCapacity: 0,
          hostname: 'host-10-250-15-133.openstacklocal',
          key: '/Common/dtdi.key',
          keyReference: {
            link:
              'https://localhost/mgmt/tm/cm/key/~Common~dtdi.key?ver=13.1.1',
          },
          managementIp: ExpectedData.networks.management.ipAddr,
          marketingName: 'BIG-IP Virtual Edition',
          mirrorIp: 'any6',
          mirrorSecondaryIp: 'any6',
          multicastIp: 'any6',
          multicastPort: 0,
          platformId: 'Z100',
          product: 'BIG-IP',
          selfDevice: 'true',
          timeZone: 'America/Los_Angeles',
          version: '13.1.1',
        },
      ],
    };
  },

  bigipAS3Info200: () => {
    return {
      version: '3.10.0',
      release: '5',
      schemaCurrent: '3.10.0',
      schemaMinimum: '3.0.0',
    };
  },

  bigipAS3Info404: () => {
    throw new HttpErrors.NotFound(
      'Public URI path not registered. Please see /var/log/restjavad.0.log and /var/log/restnoded/restnoded.log for details.',
    );
  },

  bigipPartition200: () => {
    return {
      name: 'F5_' + ExpectedData.tenantId,
    };
  },

  bigipDOChange2OK200: (state: string = 'OK') => {
    return [
      {
        id: 0,
        selfLink: 'https://localhost/mgmt/shared/declarative-onboarding/info',
        result: {
          class: 'Result',
          code: 200,
          status: state,
          message: '',
          errors: [],
        },
      },
    ];
  },

  bigipDOInfoOK200: () => {
    return [
      {
        id: 0,
        selfLink: 'https://localhost/mgmt/shared/declarative-onboarding/info',
        result: {
          class: 'Result',
          code: 200,
          status: 'OK',
          message: '',
          errors: [],
        },
      },
    ];
  },

  bigipDOUpload200: () => {
    return {
      remainingByteCount: 0,
      usedChunks: {
        0: 1536121,
      },
      totalByteCount: 1536121,
      localFilePath: '/var/config/rest/downloads/abc.rpm',
      temporaryFilePath: '/var/config/rest/downloads/tmp/abc.rpm',
      generation: 0,
      lastUpdateMicros: 1562732357892691,
    };
  },

  bigipDOInstallStatusCreated200: () => {
    return {
      packageFilePath: '/var/config/rest/downloads/abc.rpm',
      operation: 'INSTALL',
      id: 'f3a521d0-b344-44b8-a8c8-757b743a2c12',
      status: 'CREATED',
      userReference: {
        link: 'https://localhost/mgmt/shared/authz/users/admin',
      },
      identityReferences: [
        {
          link: 'https://localhost/mgmt/shared/authz/users/admin',
        },
      ],
      ownerMachineId: 'f2176dec-24d9-4202-8803-83f8473392b1',
      generation: 1,
      lastUpdateMicros: 1562732534678459,
      kind:
        'shared:iapp:package-management-tasks:iapppackagemanagementtaskstate',
      selfLink:
        'https://localhost/mgmt/shared/iapp/package-management-tasks/f3a521d0-b344-44b8-a8c8-757b743a2c12',
    };
  },

  bigipDOInstallStatusFailed200: () => {
    return {
      packageFilePath: '/var/config/rest/downloads/abc.rpm',
      operation: 'INSTALL',
      id: 'f3a521d0-b344-44b8-a8c8-757b743a2c12',
      status: 'FAILED',
      userReference: {
        link: 'https://localhost/mgmt/shared/authz/users/admin',
      },
      identityReferences: [
        {
          link: 'https://localhost/mgmt/shared/authz/users/admin',
        },
      ],
      ownerMachineId: 'f2176dec-24d9-4202-8803-83f8473392b1',
      generation: 1,
      lastUpdateMicros: 1562732534678459,
      kind:
        'shared:iapp:package-management-tasks:iapppackagemanagementtaskstate',
      selfLink:
        'https://localhost/mgmt/shared/iapp/package-management-tasks/f3a521d0-b344-44b8-a8c8-757b743a2c12',
    };
  },

  bigipDOInstallStatusFinished200: () => {
    return {
      packageFilePath: '/var/config/rest/downloads/abc.rpm',
      packageName: 'f5-declarative-onboarding-1.5.0-11.noarch',
      operation: 'INSTALL',
      packageManifest: {
        tags: ['PLUGIN'],
      },
      id: 'f3a521d0-b344-44b8-a8c8-757b743a2c12',
      status: 'FINISHED',
      startTime: '2019-07-09T21:22:14.685-0700',
      endTime: '2019-07-09T21:22:15.503-0700',
      userReference: {
        link: 'https://localhost/mgmt/shared/authz/users/admin',
      },
      identityReferences: [
        {
          link: 'https://localhost/mgmt/shared/authz/users/admin',
        },
      ],
      ownerMachineId: 'f2176dec-24d9-4202-8803-83f8473392b1',
      generation: 3,
      lastUpdateMicros: 1562732535510091,
      kind:
        'shared:iapp:package-management-tasks:iapppackagemanagementtaskstate',
      selfLink:
        'https://localhost/mgmt/shared/iapp/package-management-tasks/f3a521d0-b344-44b8-a8c8-757b743a2c12',
    };
  },
  bigipGlobalSettings200: () => {
    return {
      awsApiMaxConcurrency: 1,
      consoleInactivityTimeout: 0,
      customAddr: 'none',
      failsafeAction: 'go-offline-restart-tm',
      fileBlacklistPathPrefix:
        '{/shared/3dns/} {/shared/bin/} {/shared/core/} {/appdata/core/} {/shared/datasync/} {/shared/em/} {/shared/GeoIP/} {/shared/images/} {/shared/lib/} {/shared/lib64/} {/shared/log/} {/shared/lost+found/} {/shared/mgmt/} {/shared/nfb/} {/shared/ssh/} {/shared/statsd/} {/shared/tmstat/} {/shared/vadc/} {/config/aaa/} {/config/big3d/} {/config/bigip/} {/config/filestore/} {/config/gtm/} {/config/httpd/} {/config/ntp.conf} {/config/rndc.key} {/config/ssh/} {/config/ssl/}',
      fileBlacklistReadOnlyPathPrefix: '{/etc/shadow}',
      fileLocalPathPrefix: '{/shared/} {/tmp/}',
      fileWhitelistPathPrefix:
        '{/var/local/scf} {/tmp/} {/shared/} {/config/} {/usr/share/aws/}',
      guiSecurityBanner: 'enabled',
      guiSecurityBannerText:
        'Welcome to the BIG-IP Configuration Utility.\n\nLog in with your username and password using the fields on the left.',
      guiSetup: 'disabled',
      hostAddrMode: 'management',
      hostname: ExpectedData.bigipMgmt.hostname,
      kind: 'tm:sys:global-settings:global-settingsstate',
      lcdDisplay: 'enabled',
      ledLocator: 'disabled',
      mgmtDhcp: 'enabled',
      netReboot: 'disabled',
      passwordPrompt: 'Password',
      quietBoot: 'enabled',
      selfLink: 'https://localhost/mgmt/tm/sys/global-settings?ver=13.1.1',
      usernamePrompt: 'Username',
    };
  },

  bigipNetVlans200: () => {
    return {
      kind: 'tm:net:vlan:vlancollectionstate',
      selfLink: 'https://localhost/mgmt/tm/net/vlan?ver=13.1.1',
      items: [
        {
          kind: 'tm:net:vlan:vlanstate',
          name: 'vlan-external2',
          partition: 'Common',
          fullPath: '/Common/vlan-external2',
          generation: 375,
          selfLink:
            'https://localhost/mgmt/tm/net/vlan/~Common~vlan-external2?ver=13.1.1',
          autoLasthop: 'default',
          cmpHash: 'default',
          dagRoundRobin: 'disabled',
          dagTunnel: 'outer',
          failsafe: 'disabled',
          failsafeAction: 'failover-restart-tm',
          failsafeTimeout: 90,
          fwdMode: 'l3',
          hardwareSyncookie: 'disabled',
          ifIndex: 176,
          learning: 'enable-forward',
          mtu: 1500,
          sflow: {
            pollInterval: 0,
            pollIntervalGlobal: 'yes',
            samplingRate: 0,
            samplingRateGlobal: 'yes',
          },
          sourceChecking: 'disabled',
          synFloodRateLimit: 1000,
          syncacheThreshold: 6000,
          tag: 4092,
          interfacesReference: {
            link:
              'https://localhost/mgmt/tm/net/vlan/~Common~vlan-external2/interfaces?ver=13.1.1',
            isSubcollection: true,
          },
        },
        {
          kind: 'tm:net:vlan:vlanstate',
          name: 'vlan-failover1',
          partition: 'Common',
          fullPath: '/Common/vlan-failover1',
          generation: 357,
          selfLink:
            'https://localhost/mgmt/tm/net/vlan/~Common~vlan-failover1?ver=13.1.1',
          autoLasthop: 'default',
          cmpHash: 'default',
          dagRoundRobin: 'disabled',
          dagTunnel: 'outer',
          failsafe: 'disabled',
          failsafeAction: 'failover-restart-tm',
          failsafeTimeout: 90,
          fwdMode: 'l3',
          hardwareSyncookie: 'disabled',
          ifIndex: 144,
          learning: 'enable-forward',
          mtu: 1500,
          sflow: {
            pollInterval: 0,
            pollIntervalGlobal: 'yes',
            samplingRate: 0,
            samplingRateGlobal: 'yes',
          },
          sourceChecking: 'disabled',
          synFloodRateLimit: 1000,
          syncacheThreshold: 6000,
          tag: 4094,
          interfacesReference: {
            link:
              'https://localhost/mgmt/tm/net/vlan/~Common~vlan-failover1/interfaces?ver=13.1.1',
            isSubcollection: true,
          },
        },
        {
          kind: 'tm:net:vlan:vlanstate',
          name: 'vlan-internal1',
          partition: 'Common',
          fullPath: '/Common/vlan-internal1',
          generation: 366,
          selfLink:
            'https://localhost/mgmt/tm/net/vlan/~Common~vlan-internal1?ver=13.1.1',
          autoLasthop: 'default',
          cmpHash: 'default',
          dagRoundRobin: 'disabled',
          dagTunnel: 'outer',
          failsafe: 'disabled',
          failsafeAction: 'failover-restart-tm',
          failsafeTimeout: 90,
          fwdMode: 'l3',
          hardwareSyncookie: 'disabled',
          ifIndex: 160,
          learning: 'enable-forward',
          mtu: 1500,
          sflow: {
            pollInterval: 0,
            pollIntervalGlobal: 'yes',
            samplingRate: 0,
            samplingRateGlobal: 'yes',
          },
          sourceChecking: 'disabled',
          synFloodRateLimit: 1000,
          syncacheThreshold: 6000,
          tag: 4093,
          interfacesReference: {
            link:
              'https://localhost/mgmt/tm/net/vlan/~Common~vlan-internal1/interfaces?ver=13.1.1',
            isSubcollection: true,
          },
        },
      ],
    };
  },
  bigipnetSelfips200: () => {
    return {
      kind: 'tm:net:self:selfcollectionstate',
      selfLink: 'https://localhost/mgmt/tm/net/self?ver=13.1.1',
      items: [
        {
          kind: 'tm:net:self:selfstate',
          name: 'selfip-external2',
          partition: 'Common',
          fullPath: '/Common/selfip-external2',
          generation: 398,
          selfLink:
            'https://localhost/mgmt/tm/net/self/~Common~selfip-external2?ver=13.1.1',
          address: '10.250.41.5/24',
          addressSource: 'from-user',
          floating: 'disabled',
          inheritedTrafficGroup: 'false',
          trafficGroup: '/Common/traffic-group-local-only',
          trafficGroupReference: {
            link:
              'https://localhost/mgmt/tm/cm/traffic-group/~Common~traffic-group-local-only?ver=13.1.1',
          },
          unit: 0,
          vlan: '/Common/vlan-external2',
          vlanReference: {
            link:
              'https://localhost/mgmt/tm/net/vlan/~Common~vlan-external2?ver=13.1.1',
          },
          allowService: ['default'],
        },
        {
          kind: 'tm:net:self:selfstate',
          name: 'selfip-internal1',
          partition: 'Common',
          fullPath: '/Common/selfip-internal1',
          generation: 397,
          selfLink:
            'https://localhost/mgmt/tm/net/self/~Common~selfip-internal1?ver=13.1.1',
          address: '10.250.42.4/24',
          addressSource: 'from-user',
          floating: 'disabled',
          inheritedTrafficGroup: 'false',
          trafficGroup: '/Common/traffic-group-local-only',
          trafficGroupReference: {
            link:
              'https://localhost/mgmt/tm/cm/traffic-group/~Common~traffic-group-local-only?ver=13.1.1',
          },
          unit: 0,
          vlan: '/Common/vlan-internal1',
          vlanReference: {
            link:
              'https://localhost/mgmt/tm/net/vlan/~Common~vlan-internal1?ver=13.1.1',
          },
          allowService: ['default'],
        },
        {
          kind: 'tm:net:self:selfstate',
          name: 'selfip-failover1',
          partition: 'Common',
          fullPath: '/Common/selfip-failover1',
          generation: 396,
          selfLink:
            'https://localhost/mgmt/tm/net/self/~Common~selfip-failover1?ver=13.1.1',
          address: '10.250.50.5/24',
          addressSource: 'from-user',
          floating: 'disabled',
          inheritedTrafficGroup: 'false',
          trafficGroup: '/Common/traffic-group-local-only',
          trafficGroupReference: {
            link:
              'https://localhost/mgmt/tm/cm/traffic-group/~Common~traffic-group-local-only?ver=13.1.1',
          },
          unit: 0,
          vlan: '/Common/vlan-failover1',
          vlanReference: {
            link:
              'https://localhost/mgmt/tm/net/vlan/~Common~vlan-failover1?ver=13.1.1',
          },
          allowService: ['default'],
        },
      ],
    };
  },

  bigipNetInterfacesNone200: () => {
    return {
      items: [
        {
          bundle: 'not-supported',
          bundleSpeed: 'not-supported',
          enabled: true,
          flowControl: 'tx-rx',
          forceGigabitFiber: 'disabled',
          forwardErrorCorrection: 'not-supported',
          fullPath: '1.1',
          generation: 29,
          ifIndex: 48,
          kind: 'tm:net:interface:interfacestate',
          lldpAdmin: 'txonly',
          lldpTlvmap: 130943,
          macAddress: 'none',
          mediaActive: 'none',
          mediaFixed: '10000T-FD',
          mediaMax: 'auto',
          mediaSfp: 'auto',
          mtu: 9198,
          name: '1.1',
          portFwdMode: 'l3',
          preferPort: 'sfp',
          qinqEthertype: '0x8100',
          selfLink: 'https://localhost/mgmt/tm/net/interface/1.1?ver=13.1.1',
          sflow: {
            pollInterval: 0,
            pollIntervalGlobal: 'yes',
          },
          stp: 'enabled',
          stpAutoEdgePort: 'enabled',
          stpEdgePort: 'true',
          stpLinkType: 'auto',
        },
      ],
    };
  },

  bigipNetInterfaces200: () => {
    return {
      items: [
        {
          bundle: 'not-supported',
          bundleSpeed: 'not-supported',
          enabled: true,
          flowControl: 'tx-rx',
          forceGigabitFiber: 'disabled',
          forwardErrorCorrection: 'not-supported',
          fullPath: '1.1',
          generation: 29,
          ifIndex: 48,
          kind: 'tm:net:interface:interfacestate',
          lldpAdmin: 'txonly',
          lldpTlvmap: 130943,
          macAddress: ExpectedData.networks.external.macAddr,
          mediaActive: 'none',
          mediaFixed: '10000T-FD',
          mediaMax: 'auto',
          mediaSfp: 'auto',
          mtu: 9198,
          name: '1.1',
          portFwdMode: 'l3',
          preferPort: 'sfp',
          qinqEthertype: '0x8100',
          selfLink: 'https://localhost/mgmt/tm/net/interface/1.1?ver=13.1.1',
          sflow: {
            pollInterval: 0,
            pollIntervalGlobal: 'yes',
          },
          stp: 'enabled',
          stpAutoEdgePort: 'enabled',
          stpEdgePort: 'true',
          stpLinkType: 'auto',
        },
        {
          bundle: 'not-supported',
          bundleSpeed: 'not-supported',
          enabled: true,
          flowControl: 'tx-rx',
          forceGigabitFiber: 'disabled',
          forwardErrorCorrection: 'not-supported',
          fullPath: '1.2',
          generation: 24,
          ifIndex: 64,
          kind: 'tm:net:interface:interfacestate',
          lldpAdmin: 'txonly',
          lldpTlvmap: 130943,
          macAddress: ExpectedData.networks.internal.macAddr,
          mediaActive: 'none',
          mediaFixed: '10000T-FD',
          mediaMax: 'auto',
          mediaSfp: 'auto',
          mtu: 9198,
          name: '1.2',
          portFwdMode: 'l3',
          preferPort: 'sfp',
          qinqEthertype: '0x8100',
          selfLink: 'https://localhost/mgmt/tm/net/interface/1.2?ver=13.1.1',
          sflow: {
            pollInterval: 0,
            pollIntervalGlobal: 'yes',
          },
          stp: 'enabled',
          stpAutoEdgePort: 'enabled',
          stpEdgePort: 'true',
          stpLinkType: 'auto',
        },
        {
          bundle: 'not-supported',
          bundleSpeed: 'not-supported',
          enabled: true,
          flowControl: 'tx-rx',
          forceGigabitFiber: 'disabled',
          forwardErrorCorrection: 'not-supported',
          fullPath: '1.3',
          generation: 20,
          ifIndex: 80,
          kind: 'tm:net:interface:interfacestate',
          lldpAdmin: 'txonly',
          lldpTlvmap: 130943,
          macAddress: ExpectedData.networks.ha.macAddr,
          mediaActive: 'none',
          mediaFixed: '10000T-FD',
          mediaMax: 'auto',
          mediaSfp: 'auto',
          mtu: 9198,
          name: '1.3',
          portFwdMode: 'l3',
          preferPort: 'sfp',
          qinqEthertype: '0x8100',
          selfLink: 'https://localhost/mgmt/tm/net/interface/1.3?ver=13.1.1',
          sflow: {
            pollInterval: 0,
            pollIntervalGlobal: 'yes',
          },
          stp: 'enabled',
          stpAutoEdgePort: 'enabled',
          stpEdgePort: 'true',
          stpLinkType: 'auto',
        },
        {
          bundle: 'not-supported',
          bundleSpeed: 'not-supported',
          enabled: true,
          flowControl: 'tx-rx',
          forceGigabitFiber: 'disabled',
          forwardErrorCorrection: 'not-supported',
          fullPath: 'mgmt',
          generation: 202,
          ifIndex: 32,
          kind: 'tm:net:interface:interfacestate',
          lldpAdmin: 'txonly',
          lldpTlvmap: 130943,
          macAddress: ExpectedData.networks.management.macAddr,
          mediaActive: '100TX-FD',
          mediaFixed: 'auto',
          mediaSfp: 'auto',
          mtu: 1500,
          name: 'mgmt',
          portFwdMode: 'l3',
          preferPort: 'sfp',
          qinqEthertype: '0x8100',
          selfLink: 'https://localhost/mgmt/tm/net/interface/mgmt?ver=13.1.1',
          sflow: {
            pollInterval: 0,
            pollIntervalGlobal: 'yes',
          },
          stp: 'enabled',
          stpAutoEdgePort: 'enabled',
          stpEdgePort: 'true',
          stpLinkType: 'auto',
        },
      ],
      kind: 'tm:net:interface:interfacecollectionstate',
      selfLink: 'https://localhost/mgmt/tm/net/interface?ver=13.1.1',
    };
  },

  bigipMgmtSys200: () => {
    return {
      items: [
        {
          reference: {
            link: 'https://localhost/mgmt/tm/sys/application?ver=13.1.1',
          },
        },
        //...
        {
          reference: {
            link: 'https://localhost/mgmt/tm/sys/ucs?ver=13.1.1',
          },
        },
      ],
      kind: 'tm:sys:syscollectionstate',
      selfLink: 'https://localhost/mgmt/tm/sys?ver=13.1.1',
    };
  },

  // not used.
  bigipMgmtSysTimeout: async () => {
    //await new Promise(resolve => setTimeout(resolve, 20 * 1000));
    //return {};
    throw new HttpErrors.RequestTimeout('timeout');
  },

  onboardingProxyError502: () => {
    return new HttpErrors.BadGateway(`
    <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html>
    <head>
        <title>502 Proxy Error</title>
    </head>
    <body>
        <h1>Proxy Error</h1>
        <p>The proxy server received an invalid
response from an upstream server.
            <br />
The proxy server could not handle the request
            <em>
                <a href="/mgmt/shared/declarative-onboarding">POST&nbsp;/mgmt/shared/declarative-onboarding</a>
            </em>.
            <p>
Reason:
                <strong>Error reading from remote server</strong>
            </p>
        </p>
    </body>
</html>
`);
  },

  onboardingServerError500: () => {
    throw new HttpErrors.InternalServerError('invalid config - rolled back');
    // keep the comments here to indicate the real 500 error looks like.
    // return {
    //   code: 500,
    //   status: 'ERROR',
    //   message: 'invalid config - rolled back',
    //   errors: [
    //     "No offerings found for regkey pool license 'mykeypool-all' and the given search criteria (none)",
    //   ],
    //   declaration: {
    //     schemaVersion: '1.3.0',
    //     class: 'Device',
    //     label: 'Basic onboarding',
    //     async: false,
    //     Common: {
    //       class: 'Tenant',
    //       hostname: ExpectedData.bigipMgmt.hostname,
    //       myLicense: {
    //         class: 'License',
    //         licenseType: 'licensePool',
    //         bigIqHost: '10.250.15.119',
    //         bigIqUsername: 'admin',
    //         licensePool: 'mykeypool-all',
    //         reachable: true,
    //         bigIpUsername: 'admin',
    //         unitOfMeasure: 'monthly',
    //         overwrite: false,
    //       },
    //     },
    //   },
    // };
  },

  onboardingSucceed202: () => {
    return {
      id: ExpectedData.doTaskId,
      selfLink: `https://localhost/mgmt/shared/declarative-onboarding/task/${ExpectedData.doTaskId}`,
      result: {
        class: 'Result',
        code: 202,
        status: 'RUNNING',
        message: 'processing',
      },
      declaration: {
        schemaVersion: '1.3.0',
        class: 'Device',
        async: true,
        label: 'Basic onboarding',
        Common: {
          class: 'Tenant',
          hostname: 'f250c956-bdd7-41cd-b3d5-03a79c7d90f8.f5bigip.local',
          myLicense: {
            class: 'License',
            licenseType: 'licensePool',
            bigIqHost: '10.250.15.105',
            bigIqUsername: 'admin',
            licensePool: 'mykeypool',
            reachable: true,
            bigIpUsername: 'admin',
            unitOfMeasure: 'monthly',
            overwrite: false,
          },
          myProvision: {
            class: 'Provision',
            ltm: 'nominal',
            asm: 'nominal',
          },
          myDns: {
            class: 'DNS',
            nameServers: ['8.8.8.8'],
            search: ['openstack.local'],
          },
          myNtp: {
            class: 'NTP',
            servers: ['0.pool.ntp.org', '1.pool.ntp.org', '2.pool.ntp.org'],
            timezone: 'UTC',
          },
          'vlan-failover1': {
            class: 'VLAN',
            interfaces: [
              {
                name: '1.1',
                tagged: false,
              },
            ],
          },
          'vlan-internal1': {
            class: 'VLAN',
            interfaces: [
              {
                name: '1.2',
                tagged: false,
              },
            ],
          },
          'vlan-external2': {
            class: 'VLAN',
            interfaces: [
              {
                name: '1.3',
                tagged: false,
              },
            ],
          },
          'selfip-failover1': {
            class: 'SelfIp',
            vlan: 'vlan-failover1',
            address: '10.250.50.6/24',
            trafficGroup: 'traffic-group-local-only',
            allowService: 'default',
          },
          'selfip-internal1': {
            class: 'SelfIp',
            vlan: 'vlan-internal1',
            address: '10.250.42.9/24',
            trafficGroup: 'traffic-group-local-only',
            allowService: 'default',
          },
          'selfip-external2': {
            class: 'SelfIp',
            vlan: 'vlan-external2',
            address: '10.250.41.13/24',
            trafficGroup: 'traffic-group-local-only',
            allowService: 'default',
          },
          'route-external2': {
            class: 'Route',
            gw: '10.250.41.1',
            network: 'default',
          },
          configsync: {
            class: 'ConfigSync',
            configsyncIp: '10.250.50.6',
          },
        },
      },
    };
  },

  onboardingSucceed200: () => {
    return {
      id: ExpectedData.doTaskId,
      selfLink: `https://localhost/mgmt/shared/declarative-onboarding/task/${ExpectedData.doTaskId}`,
      result: {
        class: 'Result',
        code: 200,
        status: 'OK',
        message: 'success',
      },
      declaration: {
        schemaVersion: '1.3.0',
        class: 'Device',
        async: true,
        label: 'Basic onboarding',
        Common: {
          class: 'Tenant',
          hostname: 'f250c956-bdd7-41cd-b3d5-03a79c7d90f8.f5bigip.local',
          myLicense: {
            class: 'License',
            licenseType: 'licensePool',
            bigIqHost: '10.250.15.105',
            bigIqUsername: 'admin',
            licensePool: 'mykeypool',
            reachable: true,
            bigIpUsername: 'admin',
            unitOfMeasure: 'monthly',
            overwrite: false,
          },
          myProvision: {
            class: 'Provision',
            ltm: 'nominal',
            asm: 'nominal',
          },
          myDns: {
            class: 'DNS',
            nameServers: ['8.8.8.8'],
            search: ['openstack.local'],
          },
          myNtp: {
            class: 'NTP',
            servers: ['0.pool.ntp.org', '1.pool.ntp.org', '2.pool.ntp.org'],
            timezone: 'UTC',
          },
          'vlan-failover1': {
            class: 'VLAN',
            interfaces: [
              {
                name: '1.1',
                tagged: false,
              },
            ],
          },
          'vlan-internal1': {
            class: 'VLAN',
            interfaces: [
              {
                name: '1.2',
                tagged: false,
              },
            ],
          },
          'vlan-external2': {
            class: 'VLAN',
            interfaces: [
              {
                name: '1.3',
                tagged: false,
              },
            ],
          },
          'selfip-failover1': {
            class: 'SelfIp',
            vlan: 'vlan-failover1',
            address: '10.250.50.6/24',
            trafficGroup: 'traffic-group-local-only',
            allowService: 'default',
          },
          'selfip-internal1': {
            class: 'SelfIp',
            vlan: 'vlan-internal1',
            address: '10.250.42.9/24',
            trafficGroup: 'traffic-group-local-only',
            allowService: 'default',
          },
          'selfip-external2': {
            class: 'SelfIp',
            vlan: 'vlan-external2',
            address: '10.250.41.13/24',
            trafficGroup: 'traffic-group-local-only',
            allowService: 'default',
          },
          'route-external2': {
            class: 'Route',
            gw: '10.250.41.1',
            network: 'default',
          },
          configsync: {
            class: 'ConfigSync',
            configsyncIp: '10.250.50.6',
          },
          root: {
            class: 'User',
            userType: 'root',
            keys: [
              'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCbm1UDaANxk2v7IU8X5pQQiHWt+zFL66qiwVNOwTcpZgOb5fUiKxckkSq2DmPsI9QQG19FTV8w//iZcu/P+H2rFzJUKPYaFKYt/wqBV6iyp06NYWR7hobyxSGo/bxXd/Q40FyZwKeYAezBAgKAceTHb1YGBPyySe7CRBU2olTqlWyfrcheA1BKh4CpMp1kmeuDcTnAwi5bCZXX3esopAzWRuHhOeaViWPe1BzqcJD+uN4TOdR63QpVYr4JYFTMN7XQ8UK9QYhLxy1Llk7rT1DT2MdEhHYtVfPnjtj0T5ehWjm7pug8E2GaS/cAWUwSOWnGkEI/zuuwevAA8/JPJIGf j@BEI-ML-00',
            ],
          },
        },
      },
    };
  },

  trustProxyDeploy200: () => {
    return {
      results: [
        {
          message: 'success',
          lineCount: 26,
          code: 200,
          host: 'localhost',
          tenant: 'F5_62a18d5f73c0447985f47cd034256ff5',
          runTime: 1199,
        },
      ],
      declaration: {
        F5_62a18d5f73c0447985f47cd034256ff5: {
          class: 'Tenant',
          label: '62a18d5f73c0447985f47cd034256ff5',
          F5_3cc12f17_a6c7_4884_a119_98b456fe2020: {
            class: 'Application',
            label: '3cc12f17-a6c7-4884-a119-98b456fe2020',
            template: 'generic',
            F5_9601765a_e585_4355_bbd0_b60301d3bbdc: {
              class: 'Service_HTTP',
              label: '9601765a-e585-4355-bbd0-b60301d3bbdc',
              pool: 'F5_7f8aea96_7389_4660_94f8_a68caab4f670',
              virtualAddresses: ['10.250.41.17'],
              virtualPort: 80,
            },
            F5_7f8aea96_7389_4660_94f8_a68caab4f670: {
              class: 'Pool',
              label: '7f8aea96-7389-4660-94f8-a68caab4f670',
              loadBalancingMode: 'round-robin',
              members: [
                {
                  servicePort: 80,
                  serverAddresses: ['10.250.42.46'],
                  monitors: [
                    {
                      use: 'F5_2b70cc27_6fd8_41e7_8e97_0355cc77067b',
                    },
                  ],
                },
              ],
              monitors: [
                {
                  use: 'F5_895cc33f_7af6_4477_adc4_c286908f0e72',
                },
              ],
            },
            F5_895cc33f_7af6_4477_adc4_c286908f0e72: {
              class: 'Monitor',
              label: '895cc33f-7af6-4477-adc4-c286908f0e72',
              monitorType: 'icmp',
            },
            F5_2b70cc27_6fd8_41e7_8e97_0355cc77067b: {
              class: 'Monitor',
              label: '2b70cc27-6fd8-41e7-8e97-0355cc77067b',
              monitorType: 'icmp',
            },
          },
        },
        class: 'ADC',
        schemaVersion: '3.0.0',
        id: 'b9942494-1106-46da-bfe8-e2c47154904c',
        updateMode: 'selective',
        controls: {
          archiveTimestamp: '2019-05-30T07:35:13.004Z',
        },
      },
    };
  },

  trustProxyDeploy422: () => {
    let err = new HttpErrors.UnprocessableEntity();
    err.message = 'declaration is invalid';
    err.referer = 'http://localhost:8105/shared/TrustedProxy';
    err.originalRequestBody =
      '{"method":"Post","uri":"https://10.250.15.146:443/mgmt/shared/appsvcs/declare","body":{"class":"ADC","schemaVersion":"3.0.0","id":"b9942494-1106-46da-bfe8-e2c47154904c","F5_62a18d5f73c0447985f47cd034256ff5":{"class":"Tenant","label":"62a18d5f73c0447985f47cd034256ff5","F5_3cc12f17_a6c7_4884_a119_98b456fe2020":{"class":"Application","label":"3cc12f17-a6c7-4884-a119-98b456fe2020","template":"generic","F5_9601765a_e585_4355_bbd0_b60301d3bbdc":{"class":"Service_HTTP","label":"9601765a-e585-4355-bbd0-b60301d3bbdc","pool":"F5_7f8aea96_7389_4660_94f8_a68caab4f670","virtualAddresses":["10.250.41.17"],"virtualPort":80},"F5_7f8aea96_7389_4660_94f8_a68caab4f670":{"class":"Pool","label":"7f8aea96-7389-4660-94f8-a68caab4f670","loadBalancingMode":"round-robin","members":[{"servicePort":80,"serverAddresses":["10.250.42.46"],"monitors":[{"use":"F5_2b70cc27_6sdsfd8_41e7_8e97_0355cc77067b"}]}],"monitors":[{"use":"F5_895cc33f_7af6_4477_adc4_c286908f0e72"}]},"F5_895cc33f_7af6_4477_adc4_c286908f0e72":{"class":"Monitor","label":"895cc33f-7af6-4477-adc4-c286908f0e72","monitorType":"icmp"},"F5_2b70cc27_6fd8_41e7_8e97_0355cc77067b":{"class":"Monitor","label":"2b70cc27-6fd8-41e7-8e97-0355cc77067b","monitorType":"icmp"}}}}}';
    throw err;
  },

  trustDeviceStatusChanging200: (state: string) => {
    return {
      devices: [
        {
          targetUUID: ExpectedData.trustDeviceId,
          targetHost: '1.2.3.4',
          state: state,
        },
      ],
    };
  },

  trustDeviceStatusEmpty200: (state: string) => {
    return {
      devices: [],
    };
  },

  trustDeviceStatusActive200: (state: string) => {
    return {
      devices: [
        {
          targetUUID: ExpectedData.trustDeviceId,
          targetHost: ExpectedData.networks.management.ipAddr,
          state: 'ACTIVE',
        },
      ],
    };
  },

  trustDeviceStatusPending200: () => {
    return {
      devices: [
        {
          targetUUID: ExpectedData.trustDeviceId,
          targetHost: ExpectedData.networks.management.ipAddr,
          state: 'PENDING',
        },
      ],
    };
  },

  trustDeviceStatusCreated200: () => {
    return {
      devices: [
        {
          targetUUID: ExpectedData.trustDeviceId,
          targetHost: ExpectedData.networks.management.ipAddr,
          state: 'CREATED',
        },
      ],
    };
  },

  trustDevices200: () => {
    return {
      devices: [
        {
          targetUUID: ExpectedData.trustDeviceId,
          targetHost: ExpectedData.networks.management.ipAddr,
          state: 'ACTIVE',
        },
      ],
    };
  },

  untrustDevice200: () => {
    return {
      devices: [
        {
          state: 'DELETING',
        },
      ],
    };
  },

  untrustDevice400: () => {
    throw new Error('Not working');
  },

  untrustDeviceEmpty200: () => {
    return {
      devices: [],
    };
  },

  queryTrustedExtensionsChanging200: (state: string | undefined) => {
    if (!state) return [];
    return [
      {
        rpmFile: 'f5-appsvcs-3.10.0-5.noarch.rpm',
        state: state,
      },
    ];
  },

  queryTrustedExtensionsAvailable200: (state: string | undefined) => {
    //if (!state) return [];
    return [
      {
        rpmFile: 'f5-appsvcs-3.10.0-5.noarch.rpm',
        name: 'f5-appsvcs',
        state: 'AVAILABLE',
      },
    ];
  },

  queryTrustedExtensionsAS3NotFound200: (state: string | undefined) => {
    //if (!state) return [];
    return [
      {
        rpmFile: 'f5-appsvcs-3.10.0-5.noarch.rpm',
        name: 'anyotherplugin',
        state: 'AVAILABLE',
      },
    ];
  },

  installTrustedExtensions400: () => {
    throw new HttpErrors.BadRequest('install-not-working');
  },

  installTrustedExtensions200: () => {},

  bigiqLoginSucceed200: () => {
    return {
      token: {
        token: 'abcdefgh',
        exp: new Date().getTime() / 1000 + 300,
      },
    };
  },

  bigiqAssignLicenseSucceed202: () => {
    return {
      id: '12345678',
    };
  },

  bigiqAssignTaskFinished200: () => {
    return {
      status: 'FINISHED',
      licenseAssignmentReference: {
        link:
          'https://localhost/mgmt/cm/device/licensing/pool/regkey/licenses/a-uuid/offerings/license-key-is-here/members/another-uuid',
      },
      licenseText: 'license text',
    };
  },

  bigiqRevokeLicenseSucceed202: () => {
    return {
      id: '12345678',
    };
  },

  bigiqRevokeTaskFailed200: () => {
    return {
      status: 'FAILED',
    };
  },

  bigiqRevokeTaskFinished200: () => {
    return {
      status: 'FINISHED',
    };
  },
};

type TypeResponseWith = {
  // OpenStack APIs
  keystone_post_v2_0_tokens?: Function;
  keystone_get_v2_0_tokens?: Function;
  keystone_get_v2_0_tokens_tokenId?: Function;
  keystone_post_v3_auth_tokens?: Function;
  keystone_get_v3_auth_tokens?: Function;
  neutron_post_v2_0_ports?: Function;
  neutron_del_v2_0_ports_portId?: Function;
  neutron_put_v2_0_ports_portId?: Function;
  neutron_get_v2_0_ports_portId?: Function;
  neutron_get_v2_0_subnets?: Function;
  neutron_get_v2_0_floatingips?: Function;
  neutron_post_v2_0_floatingips?: Function;
  neutron_put_v2_0_floatingips_floatingipId?: Function;
  neutron_del_v2_0_floatingips_floatingipId?: Function;
  nova_post_v2_tenantId_servers?: Function;
  nova_del_v2_tenantId_servers_serverId?: Function;
  nova_get_v2_tenantId_servers_serverId?: Function;

  // DO APIs
  bigip_post_mgmt_shared_declaration_onboarding?: Function;
  bigip_get_mgmt_shared_declaration_onboarding_task_taskId?: Function;

  // BIG-IP APIs
  bigip_get_mgmt_tm_sys?: Function;
  bigip_get_mgmt_tm_net_interface?: Function;
  bigip_get_mgmt_tm_net_self?: Function;
  bigip_get_mgmt_tm_net_vlan?: Function;
  bigip_get_mgmt_tm_sys_global_settings?: Function;
  bigip_post_mgmt_tm_shared_licensing_activation?: Function;
  bigip_put_mgmt_tm_shared_licensing_registration?: Function;
  bigip_get_mgmt_tm_sys_license?: Function;
  bigip_get_mgmt_tm_cm_device?: Function;
  bigip_get_mgmt_shared_appsvcs_info?: Function;
  bigip_get_mgmt_tm_sys_folder__partition?: Function;
  bigip_get_mgmt_shared_declarative_onboarding_info?: Function;
  bigip_post_mgmt_shared_file_transfer_uploads_filename?: Function;
  bigip_post_mgmt_shared_iapp_package_management_tasks?: Function;
  bigip_get_mgmt_shared_iapp_package_management_tasks_taskId?: Function;

  // ASG APIs
  asg_post_mgmt_shared_trustproxy?: Function;
  asg_get_mgmt_shared_trusteddevices_deviceId?: Function;
  asg_put_mgmt_shared_trusteddevices?: Function;
  asg_get_mgmt_shared_trusteddevices?: Function;
  asg_del_mgmt_shared_trusteddevices_deviceId?: Function;
  asg_post_mgmt_shared_trustedextensions_deviceId?: Function;
  asg_get_mgmt_shared_trustedextensions_deviceId?: Function;

  // BIG-IQ APIs
  bigiq_post_login?: Function;
  bigiq_post_assign_license?: Function;
  bigiq_post_revoke_license?: Function;
  bigiq_get_assign_or_revoke_task?: Function;
};

export const DefaultResponseWith: TypeResponseWith = {
  keystone_post_v2_0_tokens: StubResponses.v2AuthToken200,
  keystone_get_v2_0_tokens: StubResponses.v2AuthToken200,
  keystone_get_v2_0_tokens_tokenId: StubResponses.v2AuthToken200,
  keystone_post_v3_auth_tokens: StubResponses.v3AuthToken200,
  keystone_get_v3_auth_tokens: StubResponses.v3AuthToken200,
  neutron_post_v2_0_ports: StubResponses.neutronCreatePort200,
  neutron_del_v2_0_ports_portId: StubResponses.neutronDeletePort200,
  neutron_put_v2_0_ports_portId: StubResponses.neutronUpdatePort200,
  neutron_get_v2_0_ports_portId: StubResponses.neutronGetPort200,
  neutron_get_v2_0_subnets: StubResponses.neutronGetSubnets200,
  nova_post_v2_tenantId_servers: StubResponses.novaCreateVM200,
  nova_del_v2_tenantId_servers_serverId: StubResponses.novaDeleteVM200,
  nova_get_v2_tenantId_servers_serverId: StubResponses.novaGetVMDetail200,
  neutron_get_v2_0_floatingips: StubResponses.neutronGetFloatingIps200,
  neutron_post_v2_0_floatingips: StubResponses.neutronPostFloatingIp201,
  neutron_put_v2_0_floatingips_floatingipId:
    StubResponses.neutronPutFloatingIp200,
  neutron_del_v2_0_floatingips_floatingipId:
    StubResponses.neutronDeleteFloatingIp204,

  bigip_post_mgmt_shared_declaration_onboarding:
    StubResponses.onboardingSucceed202,
  bigip_get_mgmt_shared_declaration_onboarding_task_taskId:
    StubResponses.onboardingSucceed200,

  bigip_get_mgmt_tm_sys: StubResponses.bigipMgmtSys200,
  bigip_get_mgmt_tm_net_interface: StubResponses.bigipNetInterfaces200,
  bigip_get_mgmt_tm_net_self: StubResponses.bigipnetSelfips200,
  bigip_get_mgmt_tm_net_vlan: StubResponses.bigipNetVlans200,
  bigip_get_mgmt_tm_sys_global_settings: StubResponses.bigipGlobalSettings200,
  bigip_post_mgmt_tm_shared_licensing_activation:
    StubResponses.bigipInstallLicenseKey200,
  bigip_put_mgmt_tm_shared_licensing_registration:
    StubResponses.bigipInstallLicenseText200,
  bigip_get_mgmt_tm_sys_license: StubResponses.bigipLiense200,
  bigip_get_mgmt_tm_cm_device: StubResponses.bigipCmDevice200,
  bigip_get_mgmt_shared_appsvcs_info: StubResponses.bigipAS3Info200,
  bigip_get_mgmt_tm_sys_folder__partition: StubResponses.bigipPartition200,
  bigip_get_mgmt_shared_declarative_onboarding_info:
    StubResponses.bigipDOInfoOK200,
  bigip_post_mgmt_shared_file_transfer_uploads_filename:
    StubResponses.bigipDOUpload200,
  bigip_post_mgmt_shared_iapp_package_management_tasks:
    StubResponses.bigipDOInstallStatusCreated200,
  bigip_get_mgmt_shared_iapp_package_management_tasks_taskId:
    StubResponses.bigipDOInstallStatusFinished200,

  asg_post_mgmt_shared_trustproxy: StubResponses.trustProxyDeploy200,
  asg_get_mgmt_shared_trusteddevices_deviceId:
    StubResponses.trustDeviceStatusActive200,
  asg_put_mgmt_shared_trusteddevices: StubResponses.trustDeviceStatusActive200,
  asg_get_mgmt_shared_trusteddevices: StubResponses.trustDevices200,
  asg_del_mgmt_shared_trusteddevices_deviceId: StubResponses.untrustDevice200,
  asg_post_mgmt_shared_trustedextensions_deviceId:
    StubResponses.installTrustedExtensions200,
  asg_get_mgmt_shared_trustedextensions_deviceId:
    StubResponses.queryTrustedExtensionsAvailable200,

  bigiq_post_login: StubResponses.bigiqLoginSucceed200,
  bigiq_post_assign_license: StubResponses.bigiqAssignLicenseSucceed202,
  bigiq_post_revoke_license: StubResponses.bigiqRevokeLicenseSucceed202,
  bigiq_get_assign_or_revoke_task: StubResponses.bigiqRevokeTaskFinished200,
};

export const ResponseWith: TypeResponseWith = {};

export function LetResponseWith(spec?: TypeResponseWith) {
  Object.assign(ResponseWith, DefaultResponseWith, spec);
}
