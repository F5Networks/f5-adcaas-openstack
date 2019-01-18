import {
  WafpolicyRepository,
  ApplicationRepository,
} from '../../src/repositories';
import {testdb} from '../fixtures/datasources/testdb.datasource';
import {Wafpolicy} from '../../src/models';
import {Application} from '../../src/models';

export async function givenEmptyDatabase() {
  await new WafpolicyRepository(testdb).deleteAll();
  await new ApplicationRepository(testdb).deleteAll();
}

export function givenWafpolicyData1(data?: Partial<Wafpolicy>) {
  return Object.assign(
    {
      id: '4225f224-df91-30b2-258c0e766b2a',
      name: 'test waf policy 1',
      content:
        '<?xml version="1.0" encoding="utf-8"?>' +
        '<policy bigip_version="11.6.0" integrity_check=' +
        '"6d097acbaa3d38a61152dab35e74e52e" ' +
        'name="/Common/linux-high">' +
        '  <policy_version>' +
        '<timestamp>2015-05-29T14:53:17Z</timestamp>' +
        '<device_name>bigip1</device_name>' +
        '<policy_name>/Common/linux-high</policy_name>' +
        '<last_change>Policy Attributes  [update]: ' +
        'Policy Builder determined that security policy ' +
        '"/Common/linux-high" is unstable. { audit: component = ' +
        'Policy Builder }</last_change>' +
        '</policy_version>' +
        '</policy>',
      shared: false,
      tenant: 'admin',
      created_at: '2019-01-21 05:03:45.502',
    },
    data,
  );
}

export async function givenWafpolicyData(data?: Partial<Wafpolicy>) {
  return await new WafpolicyRepository(testdb).create(
    givenWafpolicyData1(data),
  );
}

export function givenApplicationData1(data?: Partial<Application>) {
  return Object.assign(
    {
      id: '',
      name: 'test application 1',
      description: 'application test data',
      declaration: '{"class": "ADC"}',
      status: 'Done',
      created_at: '2019-01-21 05:03:52.046',
      updated_at: '2019-01-21 05:03:52.063',
      wafpolicy_id: '4225f224-df91-30b2-258c0e766b2a',
    },
    data,
  );
}

export async function givenApplicationData(data?: Partial<Application>) {
  return await new ApplicationRepository(testdb).create(
    givenApplicationData1(data),
  );
}
