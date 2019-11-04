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

import {findByKey} from '../../src/utils';
import {expect} from '@loopback/testlab';

describe('unit test for utils', () => {
  it('findByKey: found', () => {
    let obj = {
      body: {
        F5_ebce159403624ae38376161574130473: {
          F5_3d031832_2557_4c08_bc56_cb7bfa015de3: {
            F5_7eb4641a_3e6f_423d_8672_e382c1b269c4: {
              class: 'Service_HTTP',
              label: '7eb4641a-3e6f-423d-8672-e382c1b269c4',
              policyEndpoint: [],
              pool: 'F5_96cf8291_8e4e_4128_b782_d104d9da9dbe',
              virtualAddresses: ['10.250.41.3'],
              virtualPort: 80,
            },
            F5_96cf8291_8e4e_4128_b782_d104d9da9dbe: {
              class: 'Pool',
              label: '96cf8291-8e4e-4128-b782-d104d9da9dbe',
              loadBalancingMode: 'round-robin',
              members: [
                {
                  monitors: [
                    {
                      use: 'F5_bec3f4af_20dc_4581_9809_af8b00a78e5d',
                    },
                  ],
                  serverAddresses: ['10.250.42.5'],
                  servicePort: 80,
                },
              ],
              monitors: [
                {
                  use: 'F5_fb199857_9531_4f43_bec6_156e1820dea8',
                },
              ],
            },
            F5_bec3f4af_20dc_4581_9809_af8b00a78e5d: {
              class: 'Monitor',
              label: 'bec3f4af-20dc-4581-9809-af8b00a78e5d',
              monitorType: 'icmp',
            },
            F5_fb199857_9531_4f43_bec6_156e1820dea8: {
              class: 'Monitor',
              label: 'fb199857-9531-4f43-bec6-156e1820dea8',
              monitorType: 'icmp',
            },
            class: 'Application',
            label: '3d031832-2557-4c08-bc56-cb7bfa015de3',
            template: 'generic',
          },
          class: 'Tenant',
          label: 'ebce159403624ae38376161574130473',
        },
        class: 'ADC',
        id: 'ecb00b5d-0057-48b5-8339-eda9954920e1',
        schemaVersion: '3.0.0',
      },
      method: 'Post',
      uri: 'https://10.250.25.121:443/mgmt/shared/appsvcs/declare',
    };

    let a = findByKey(obj, 'serverAddresses');
    expect(a.length).eql(1);
    expect(a[0]).deepEqual(['10.250.42.5']);

    let b = findByKey(obj, 'class');
    expect(b.length).eql(7);
  });

  it('findByKey: not found', () => {
    let obj = {
      body: {
        F5_ebce159403624ae38376161574130473: {
          F5_3d031832_2557_4c08_bc56_cb7bfa015de3: {
            F5_7eb4641a_3e6f_423d_8672_e382c1b269c4: {
              class: 'Service_HTTP',
              label: '7eb4641a-3e6f-423d-8672-e382c1b269c4',
              policyEndpoint: [],
              pool: 'F5_96cf8291_8e4e_4128_b782_d104d9da9dbe',
              virtualAddresses: ['10.250.41.3'],
              virtualPort: 80,
            },
            F5_96cf8291_8e4e_4128_b782_d104d9da9dbe: {
              class: 'Pool',
              label: '96cf8291-8e4e-4128-b782-d104d9da9dbe',
              loadBalancingMode: 'round-robin',
              members: [
                {
                  monitors: [
                    {
                      use: 'F5_bec3f4af_20dc_4581_9809_af8b00a78e5d',
                    },
                  ],
                  serverAddresses: ['10.250.42.5'],
                  servicePort: 80,
                },
              ],
              monitors: [
                {
                  use: 'F5_fb199857_9531_4f43_bec6_156e1820dea8',
                },
              ],
            },
            F5_bec3f4af_20dc_4581_9809_af8b00a78e5d: {
              class: 'Monitor',
              label: 'bec3f4af-20dc-4581-9809-af8b00a78e5d',
              monitorType: 'icmp',
            },
            F5_fb199857_9531_4f43_bec6_156e1820dea8: {
              class: 'Monitor',
              label: 'fb199857-9531-4f43-bec6-156e1820dea8',
              monitorType: 'icmp',
            },
            class: 'Application',
            label: '3d031832-2557-4c08-bc56-cb7bfa015de3',
            template: 'generic',
          },
          class: 'Tenant',
          label: 'ebce159403624ae38376161574130473',
        },
        class: 'ADC',
        id: 'ecb00b5d-0057-48b5-8339-eda9954920e1',
        schemaVersion: '3.0.0',
      },
      method: 'Post',
      uri: 'https://10.250.25.121:443/mgmt/shared/appsvcs/declare',
    };

    let a = findByKey(obj, 'not-exists-key');
    expect(a.length).eql(0);
  });

  it('findByKey: find on empty object', () => {
    let obj = {};
    let a = findByKey(obj, 'serverAddresses');
    expect(a.length).eql(0);
  });

  it('findByKey: find with empty key', () => {
    let obj = {
      method: 'Post',
      uri: 'https://10.250.25.121:443/mgmt/shared/appsvcs/declare',
    };
    let a = findByKey(obj, '');
    expect(a.length).eql(0);
  });

  it('findByKey: find on array and not found', () => {
    let obj = [
      {
        use: 'F5_bec3f4af_20dc_4581_9809_af8b00a78e5d',
      },
      {
        get: 'F5_bec3f4af_20dc_4581_9809_af8b00a78e5d',
      },
      {
        post: 'F5_bec3f4af_20dc_4581_9809_af8b00a78e5d',
      },
    ];

    let a = findByKey(obj, 'put');
    expect(a.length).eql(0);
  });

  it('findByKey: find on array and found', () => {
    let obj = [
      {
        use: 'F5_bec3f4af_20dc_4581_9809_af8b00a78e5d',
      },
      {
        get: 'F5_bec3f4af_20dc_4581_9809_af8b00a78e5d',
      },
      {
        post: 'F5_bec3f4af_20dc_4581_9809_af8b00a78e5d',
      },
    ];

    let a = findByKey(obj, 'post');
    expect(a.length).eql(1);
  });

  it('findByKey: find on empty array', () => {
    let obj: string[] = [];

    let a = findByKey(obj, 'put');
    expect(a.length).eql(0);
  });
});
