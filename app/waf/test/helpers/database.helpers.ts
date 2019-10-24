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
  AdcRepository,
  WafpolicyRepository,
  ApplicationRepository,
  AdcTenantAssociationRepository,
  DeclarationRepository,
  ServiceEndpointpolicyAssociationRepository,
  PoolRepository,
  MemberRepository,
  RuleRepository,
  EndpointpolicyRepository,
  ConditionRepository,
  ActionRepository,
  MonitorRepository,
  MemberMonitorAssociationRepository,
  PoolMonitorAssociationRepository,
  ProfileHTTPCompressionRepository,
  IRuleRepository,
  ProfileHTTPProfileRepository,
  ProfileHTTP2ProfileRepository,
} from '../../src/repositories';

import {
  Application,
  Declaration,
  Wafpolicy,
  AdcTenantAssociation,
  Service,
  ServiceEndpointpolicyAssociation,
  Pool,
  Member,
  Rule,
  Endpointpolicy,
  Condition,
  Action,
  Monitor,
  MemberMonitorAssociation,
  PoolMonitorAssociation,
  ProfileHTTPCompression,
  IRule,
  ProfileHttpProfile,
  ProfileHTTP2Profile,
} from '../../src/models';
import uuid = require('uuid');
import {WafApplication} from '../../src';
import {isNullOrUndefined} from 'util';
import {BigipBuiltInProperties} from '../../src/services';
import {merge} from '../../src/utils';
import {ExpectedData} from '../fixtures/datasources/testrest.datasource';

export async function givenEmptyDatabase(wafapp: WafApplication) {
  await Promise.all(
    wafapp
      .find(/^repositories.*/)
      .map(b => wafapp.getRepository(b.valueConstructor!)),
  ).then(repos => repos.forEach(r => r.deleteAll()));
}

export function createWafpolicyObject(data?: Partial<Wafpolicy>) {
  return Object.assign(
    {
      name: 'test waf policy',
      url: 'http://unknown',
    },
    data,
  );
}

export function createEndpointpolicyObject(data?: Partial<Endpointpolicy>) {
  return Object.assign(
    {
      name: 'E1',
    },
    data,
  );
}
export function createRuleObject(data?: Partial<Rule>) {
  return Object.assign(
    {
      name: 'test',
    },
    data,
  );
}

export function createConditionObject(data?: Partial<Condition>) {
  return Object.assign(
    {
      type: 'httpUri',
      path: {operand: 'contains', values: ['/test1/']},
    },
    data,
  );
}

export function createActionObject(data?: Partial<Action>) {
  return Object.assign(
    {
      type: 'waf',
    },
    data,
  );
}
export function createIRuleObject(data?: Partial<IRule>) {
  return Object.assign(
    {
      iRule: 'when HTTP_REQUEST {\n}\n',
    },
    data,
  );
}

export async function givenIRuleData(
  wafapp: WafApplication,
  data?: Partial<IRule>,
) {
  const iRuleRepo = await wafapp.getRepository(IRuleRepository);
  const obj = createIRuleObject(
    Object.assign({tenantId: ExpectedData.tenantId}, data),
  );

  return await iRuleRepo.create(obj);
}

export function createProfileHTTPCompressionObject(
  data?: Partial<ProfileHTTPCompression>,
) {
  return Object.assign({}, data);
}

export async function givenProfileHTTPCompressionData(
  wafapp: WafApplication,
  data?: Partial<ProfileHTTPCompression>,
) {
  const profrepo = await wafapp.getRepository(ProfileHTTPCompressionRepository);
  const obj = createProfileHTTPCompressionObject(
    Object.assign({tenantId: ExpectedData.tenantId}, data),
  );

  return await profrepo.create(obj);
}

export function createProfileHTTPProfileObject(
  data?: Partial<ProfileHttpProfile>,
) {
  return Object.assign({}, data);
}

export async function givenProfileHTTPProfileData(
  wafapp: WafApplication,
  data?: Partial<ProfileHttpProfile>,
) {
  const profrepo = await wafapp.getRepository(ProfileHTTPProfileRepository);
  const obj = createProfileHTTPProfileObject(
    Object.assign({tenantId: ExpectedData.tenantId}, data),
  );

  return await profrepo.create(obj);
}

export function createProfileHTTP2ProfileObject(
  data?: Partial<ProfileHTTP2Profile>,
) {
  return Object.assign({}, data);
}

export async function givenProfileHTTP2ProfileData(
  wafapp: WafApplication,
  data?: Partial<ProfileHTTP2Profile>,
) {
  const prof2repo = await wafapp.getRepository(ProfileHTTP2ProfileRepository);
  const obj = createProfileHTTP2ProfileObject(
    Object.assign({tenantId: ExpectedData.tenantId}, data),
  );

  return await prof2repo.create(obj);
}

export async function givenEndpointpolicyData(
  wafapp: WafApplication,
  data?: Partial<Endpointpolicy>,
) {
  const endpointpolicyrepo = await wafapp.getRepository(
    EndpointpolicyRepository,
  );
  const obj = createEndpointpolicyObject(
    Object.assign({tenantId: ExpectedData.tenantId}, data),
  );
  return await endpointpolicyrepo.create(obj);
}

export async function givenRuleData(
  wafapp: WafApplication,
  data?: Partial<Rule>,
) {
  const rulerepo = await wafapp.getRepository(RuleRepository);
  const obj = createRuleObject(
    Object.assign({tenantId: ExpectedData.tenantId}, data),
  );

  if (isNullOrUndefined(obj.endpointpolicyId)) {
    obj.endpointpolicyId = uuid();
  }

  return await rulerepo.create(obj);
}

export async function givenConditionData(
  wafapp: WafApplication,
  data?: Partial<Condition>,
) {
  const conditionrepo = await wafapp.getRepository(ConditionRepository);
  const obj = createConditionObject(data);
  obj.id = uuid();
  obj.tenantId = ExpectedData.tenantId;
  return await conditionrepo.create(obj);
}

export async function givenActionData(
  wafapp: WafApplication,
  data?: Partial<Action>,
) {
  const repo = await wafapp.getRepository(ActionRepository);
  let obj = createActionObject(
    Object.assign({tenantId: ExpectedData.tenantId}, data),
  );
  return await repo.create(obj);
}

export async function givenWafpolicyData(
  wafapp: WafApplication,
  data?: Partial<Wafpolicy>,
) {
  const wafpolicyrepo = await wafapp.getRepository(WafpolicyRepository);
  const obj = createWafpolicyObject(
    Object.assign({tenantId: ExpectedData.tenantId}, data),
  );
  return await wafpolicyrepo.create(obj);
}

export function createApplicationObject(data?: Partial<Application>) {
  return Object.assign(
    {
      name: 'test application',
      description: 'application test data',
      status: 'Done',
    },
    data,
  );
}

export async function givenApplicationData(
  wafapp: WafApplication,
  data?: Partial<Application>,
) {
  const apprepo = await wafapp.getRepository(ApplicationRepository);
  const obj = createApplicationObject(
    Object.assign({tenantId: ExpectedData.tenantId}, data),
  );
  return await apprepo.create(obj);
}

export function createAdcObject(data?: object) {
  if (!data) data = {};
  let obj = merge(
    {
      name: 'adc target',
      description: 'my adc description',
      type: 'VE',
      networks: {
        mgmt1: {
          type: 'mgmt',
          networkId: ExpectedData.networks.management.networkId,
          fixedIp: ExpectedData.networks.management.ipAddr,
        },
        failover1: {
          type: 'ha',
          networkId: ExpectedData.networks.ha.networkId,
          fixedIp: ExpectedData.networks.ha.ipAddr,
        },
        internal1: {
          type: 'int',
          networkId: ExpectedData.networks.internal.networkId,
          fixedIp: ExpectedData.networks.internal.ipAddr,
        },
        external2: {
          type: 'ext',
          networkId: ExpectedData.networks.external.networkId,
          fixedIp: ExpectedData.networks.external.ipAddr,
          floatingIp: '10.250.14.160',
        },
      },
      compute: {
        imageRef: '10b7f45b-2837-4f90-a8d8-eae33f48d1cd',
        flavorRef: 'fde45211da0a44ecbf38cb0b644ab30d',
        // vmId: ExpectedData.vmId,
        sshKey:
          'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCbm1UDaANxk2v7IU8X5pQQiHWt+zFL66qiwVNOwTcpZgOb5fUiKxckkSq2DmPsI9QQG19FTV8w//iZcu/P+H2rFzJUKPYaFKYt/wqBV6iyp06NYWR7hobyxSGo/bxXd/Q40FyZwKeYAezBAgKAceTHb1YGBPyySe7CRBU2olTqlWyfrcheA1BKh4CpMp1kmeuDcTnAwi5bCZXX3esopAzWRuHhOeaViWPe1BzqcJD+uN4TOdR63QpVYr4JYFTMN7XQ8UK9QYhLxy1Llk7rT1DT2MdEhHYtVfPnjtj0T5ehWjm7pug8E2GaS/cAWUwSOWnGkEI/zuuwevAA8/JPJIGf j@BEI-ML-00',
      },
      management: {
        networks: {
          mgmt1: {
            fixedIp: ExpectedData.networks.management.ipAddr,
            macAddr: ExpectedData.networks.management.macAddr,
            portId: ExpectedData.networks.management.portId,
          },
          failover1: {
            macAddr: ExpectedData.networks.ha.macAddr,
            fixedIp: ExpectedData.networks.ha.ipAddr,
          },
          internal1: {
            macAddr: ExpectedData.networks.internal.macAddr,
            fixedIp: ExpectedData.networks.internal.ipAddr,
          },
          external2: {
            macAddr: ExpectedData.networks.external.macAddr,
            fixedIp: ExpectedData.networks.external.ipAddr,
            floatingIp: '10.250.14.160',
            floatingIpId: '10b2f45b-2837-4f90-a8d8-eae33f48d2cd',
            floatingIpCreated: true,
          },
        },
        connection: {
          ipAddress: ExpectedData.networks.management.ipAddr,
          tcpPort: BigipBuiltInProperties.port,
          username: BigipBuiltInProperties.admin,
          password: 'admin',
        },
        vmId: ExpectedData.vmId,
      },
    },
    data,
  );
  return obj;
}

export async function givenDeclarationData(
  wafapp: WafApplication,
  data?: Partial<Declaration>,
) {
  const repo = await wafapp.getRepository(DeclarationRepository);
  const obj = createDeclarationObject(data);
  return await repo.create(obj);
}

export function createDeclarationObject(data?: Partial<Declaration>) {
  return Object.assign(
    {
      id: uuid(),
      name: 'delaration',
      tenantId: ExpectedData.tenantId,
      content: {
        class: 'ADC',
        schemaVersion: '3.0.0',
        id: 'urn:uuid:33045210-3ab8-4636-9b2a-c98d22ab915d',
        label: 'Sample 1',
        remark: 'Simple HTTP application with RR pool',
        Sample_01: {
          class: 'Tenant',
          A1: {
            class: 'Application',
            template: 'http',
            serviceMain: {
              class: 'Service_HTTP',
              virtualAddresses: [ExpectedData.networks.external.virtualAddress],
              pool: 'web_pool',
            },
            web_pool: {
              class: 'Pool',
              monitors: ['http'],
              members: [
                {
                  servicePort: 80,
                  serverAddresses: ['192.0.1.10', '192.0.1.11'],
                },
              ],
            },
          },
        },
      },
    },
    data,
  );
}

export async function givenAdcData(wafapp: WafApplication, data?: object) {
  const adcpepo = await wafapp.getRepository(AdcRepository);
  const obj = createAdcObject(
    Object.assign({tenantId: ExpectedData.tenantId}, data),
  );
  return await adcpepo.create(obj);
}

export async function givenAdcTenantAssociationData(
  wafapp: WafApplication,
  data?: Partial<AdcTenantAssociation>,
) {
  const repo = await wafapp.getRepository(AdcTenantAssociationRepository);
  const obj = createAdcTenantAssociationObject(
    Object.assign({tenantId: ExpectedData.tenantId}, data),
  );
  return await repo.create(obj);
}

export function createAdcTenantAssociationObject(
  data?: Partial<AdcTenantAssociation>,
) {
  return Object.assign(
    {
      tenantId: ExpectedData.tenantId,
      adcId: uuid(),
    },
    data,
  );
}

export async function givenServiceData(
  wafapp: WafApplication,
  appId: string,
  data?: Partial<Service>,
) {
  const appRepo = await wafapp.getRepository(ApplicationRepository);
  const obj = createServiceObject(
    Object.assign({tenantId: ExpectedData.tenantId}, data),
  );
  return await appRepo.services(appId).create(obj);
}

export function createServiceObject(data?: Partial<Service>) {
  return Object.assign(
    {
      type: 'HTTP',
      virtualAddresses: ['10.0.1.11'],
    },
    data,
  );
}

export async function givenServiceEndpointpolicyAssociationData(
  wafapp: WafApplication,
  data?: Partial<ServiceEndpointpolicyAssociation>,
) {
  const repo = await wafapp.getRepository(
    ServiceEndpointpolicyAssociationRepository,
  );
  return await repo.create(createServiceEndpointpolicyAssociationObject(data));
}

export function createServiceEndpointpolicyAssociationObject(
  data?: Partial<ServiceEndpointpolicyAssociation>,
) {
  return Object.assign(
    {
      serviceId: uuid(),
      endpointpolicyId: uuid(),
    },
    data,
  );
}

export async function givenPoolData(
  wafapp: WafApplication,
  data?: Partial<Pool>,
) {
  const repo = await wafapp.getRepository(PoolRepository);
  const obj = createPoolObject(
    Object.assign({tenantId: ExpectedData.tenantId}, data),
  );
  return await repo.create(obj);
}

export function createPoolObject(data?: Partial<Pool>) {
  return Object.assign(
    {
      loadBalancingMode: 'round-robin',
    },
    data,
  );
}

export async function givenMemberData(
  wafapp: WafApplication,
  data?: Partial<Member>,
) {
  const repo = await wafapp.getRepository(MemberRepository);
  const obj = createMemberObject(
    Object.assign({tenantId: ExpectedData.tenantId}, data),
  );
  return await repo.create(obj);
}

export function createMemberObject(data?: Partial<Member>) {
  return Object.assign(
    {
      address: '192.0.1.23',
      port: 80,
    },
    data,
  );
}

export async function givenMonitorData(
  wafapp: WafApplication,
  data?: Partial<Monitor>,
) {
  const repo = await wafapp.getRepository(MonitorRepository);
  const obj = createMonitorObject(
    Object.assign({tenantId: ExpectedData.tenantId}, data),
  );
  return await repo.create(obj);
}

export function createMonitorObject(data?: Partial<Monitor>) {
  return Object.assign(
    {
      targetAddress: '192.0.1.23',
      targetPort: 80,
      monitorType: 'http',
    },
    data,
  );
}

export function createMemberMonitorAssociationObject(
  data?: Partial<MemberMonitorAssociation>,
) {
  return Object.assign(
    {
      memberId: uuid(),
      monitorId: uuid(),
    },
    data,
  );
}

export function createPoolMonitorAssociationObject(
  data?: Partial<PoolMonitorAssociation>,
) {
  return Object.assign(
    {
      poolId: uuid(),
      monitorId: uuid(),
    },
    data,
  );
}

export async function giveMemberMonitorAssociationData(
  wafapp: WafApplication,
  data?: Partial<MemberMonitorAssociation>,
) {
  const repo = await wafapp.getRepository(MemberMonitorAssociationRepository);

  return await repo.create(createMemberMonitorAssociationObject(data));
}

export async function givePoolMonitorAssociationData(
  wafapp: WafApplication,
  data?: Partial<PoolMonitorAssociation>,
) {
  const repo = await wafapp.getRepository(PoolMonitorAssociationRepository);

  return await repo.create(createPoolMonitorAssociationObject(data));
}
