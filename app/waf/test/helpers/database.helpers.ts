import {
  AdcRepository,
  WafpolicyRepository,
  ApplicationRepository,
  AdcTenantAssociationRepository,
  DeclarationRepository,
  ServiceRepository,
  ServiceEndpointpolicyAssociationRepository,
  PoolRepository,
  MemberRepository,
  RuleRepository,
  EndpointpolicyRepository,
  ConditionRepository,
  ActionRepository,
  MonitorRepository,
  MemberMonitorAssociationRepository,
  PoolMonitorAssocRepository,
} from '../../src/repositories';

import {
  Adc,
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
} from '../../src/models';
import uuid = require('uuid');
import {WafApplication} from '../../src';
import {isNullOrUndefined} from 'util';

export async function givenEmptyDatabase(wafapp: WafApplication) {
  const wafpolicyrepo = await wafapp.getRepository(WafpolicyRepository);
  await wafpolicyrepo.deleteAll();

  const apprepo = await wafapp.getRepository(ApplicationRepository);
  await apprepo.deleteAll();

  const adcrepo = await wafapp.getRepository(AdcRepository);
  await adcrepo.deleteAll();

  const tenantRepo = await wafapp.getRepository(AdcTenantAssociationRepository);
  await tenantRepo.deleteAll();

  const serviceRepo = await wafapp.getRepository(ServiceRepository);
  await serviceRepo.deleteAll();

  const poolRepo = await wafapp.getRepository(PoolRepository);
  await poolRepo.deleteAll();

  const memberRepo = await wafapp.getRepository(MemberRepository);
  await memberRepo.deleteAll();

  const ruleRepo = await wafapp.getRepository(RuleRepository);
  await ruleRepo.deleteAll();

  const endpointpolicyRepo = await wafapp.getRepository(
    EndpointpolicyRepository,
  );
  await endpointpolicyRepo.deleteAll();

  const monitorRepo = await wafapp.getRepository(MonitorRepository);
  await monitorRepo.deleteAll();

  const memberMonitorRepo = await wafapp.getRepository(
    MemberMonitorAssociationRepository,
  );
  await memberMonitorRepo.deleteAll();
  const poolmonitorRepo = await wafapp.getRepository(
    PoolMonitorAssocRepository,
  );
  await poolmonitorRepo.deleteAll();
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
export async function givenEndpointpolicyData(
  wafapp: WafApplication,
  data?: Partial<Endpointpolicy>,
) {
  const endpointpolicyrepo = await wafapp.getRepository(
    EndpointpolicyRepository,
  );
  const obj = createEndpointpolicyObject(data);
  obj.id = uuid();

  return await endpointpolicyrepo.create(obj);
}

export async function givenRuleData(
  wafapp: WafApplication,
  data?: Partial<Rule>,
) {
  const rulerepo = await wafapp.getRepository(RuleRepository);
  const obj = createRuleObject(data);
  obj.id = uuid();

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
  return await conditionrepo.create(obj);
}

export async function givenActionData(
  wafapp: WafApplication,
  data?: Partial<Action>,
) {
  const repo = await wafapp.getRepository(ActionRepository);
  return await repo.create(createActionObject(data));
}

export async function givenWafpolicyData(
  wafapp: WafApplication,
  data?: Partial<Wafpolicy>,
) {
  const wafpolicyrepo = await wafapp.getRepository(WafpolicyRepository);
  const obj = createWafpolicyObject(data);
  return await wafpolicyrepo.create(obj);
}

export function createApplicationObject(data?: Partial<Application>) {
  return Object.assign(
    {
      name: 'test application',
      description: 'application test data',
      status: 'Done',
      tenantId: 'TBD',
    },
    data,
  );
}

export async function givenApplicationData(
  wafapp: WafApplication,
  data?: Partial<Application>,
) {
  const apprepo = await wafapp.getRepository(ApplicationRepository);
  const obj = createApplicationObject(data);
  obj.id = uuid();
  return await apprepo.create(obj);
}

export function createAdcObject(data?: Partial<Adc>) {
  return Object.assign(
    {
      name: 'adc target',
      type: 'HW',
      //platformType: 'OpenStack',
      networks: [{networkId: '0dfc2e39eb83466a805983426f8d8e9b'}],
      compute: {
        imageRef: '10b7f45b-2837-4f90-a8d8-eae33f48d1cd',
        flavorRef: 'fde45211da0a44ecbf38cb0b644ab30d',
      },
      //floatingNetworkId: 'ee1eca47dc88f4879d8a229cc70a07c6',
      management: {
        ipAddress: '172.16.10.11',
        tcpPort: 8080,
        //username: 'admin',
      },
      //onBoarding: {...}
    },
    data,
  );
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
      content: {},
    },
    data,
  );
}

export async function givenAdcData(
  wafapp: WafApplication,
  data?: Partial<Adc>,
) {
  const adcpepo = await wafapp.getRepository(AdcRepository);
  const obj = createAdcObject(data);
  return await adcpepo.create(new Adc(obj));
}

export async function givenAdcTenantAssociationData(
  wafapp: WafApplication,
  data?: Partial<AdcTenantAssociation>,
) {
  const repo = await wafapp.getRepository(AdcTenantAssociationRepository);
  return await repo.create(createAdcTenantAssociationObject(data));
}

export function createAdcTenantAssociationObject(
  data?: Partial<AdcTenantAssociation>,
) {
  return Object.assign(
    {
      tenantId: uuid(),
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
  const obj = createServiceObject(data);
  return await appRepo.services(appId).create(new Service(obj));
}

export function createServiceObject(data?: Partial<Service>) {
  return Object.assign(
    {
      id: uuid(),
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
  return await repo.create(createPoolObject(data));
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
  return await repo.create(createMemberObject(data));
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
  return await repo.create(createMonitorObject(data));
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
  const repo = await wafapp.getRepository(PoolMonitorAssocRepository);

  return await repo.create(createPoolMonitorAssociationObject(data));
}
