import {HttpErrors} from '@loopback/rest';
import {ExpectedData} from '../controllers/mock.openstack.controller';

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
            id: 'fde45211da0a44ecbf38cb0b644ab30d',
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
        expires_at: '2020-05-03T02:15:58.000000Z',
        project: {
          domain: {
            id: 'default',
            name: 'Default',
          },
          id: 'fde45211da0a44ecbf38cb0b644ab30d',
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

  neutronCreatePort200: () => {
    return {
      port: {
        status: 'DOWN',
        'binding:host_id': '',
        description: '',
        allowed_address_pairs: [],
        tags: [],
        extra_dhcp_opts: [],
        updated_at: '2019-03-14T03:16:34Z',
        device_owner: '',
        revision_number: 4,
        'binding:profile': {},
        fixed_ips: [
          {
            subnet_id: '86f9f11b-0895-4af7-b3cf-71acda85f1db',
            ip_address: '10.1.1.15',
          },
        ],
        id: ExpectedData.portId,
        security_groups: ['24989b80-aacd-4c74-aabd-dcb1f55e5012'],
        device_id: '',
        name: 'port-port-name-729171',
        admin_state_up: true,
        network_id: '89449ba4-34f8-404d-93f6-fd1fd8a8296e',
        tenant_id: 'ef9fd3e3df664e558f043bd24c1fca21',
        'binding:vif_details': {},
        'binding:vnic_type': 'normal',
        'binding:vif_type': 'unbound',
        mac_address: 'fa:16:3e:c5:dd:ae',
        project_id: 'ef9fd3e3df664e558f043bd24c1fca21',
        created_at: '2019-03-14T03:16:34Z',
      },
    };
  },
};
