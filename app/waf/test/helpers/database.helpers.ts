import {
  WafpolicyRepository,
  ApplicationRepository,
  TenantAssociationRepository,
  ServiceRepository,
  PoolRepository,
  MemberRepository,
} from '../../src/repositories';

import {
  Application,
  Wafpolicy,
  TenantAssociation,
  Service,
  Pool,
  Member,
} from '../../src/models';
import uuid = require('uuid');
import {WafApplication} from '../../src';
import {AdcRepository} from '../../src/repositories/adc.repository';
import {Adc} from '../../src/models/adc.model';

export async function givenEmptyDatabase(wafapp: WafApplication) {
  const wafpolicyrepo = await wafapp.getRepository(WafpolicyRepository);
  await wafpolicyrepo.deleteAll();

  const apprepo = await wafapp.getRepository(ApplicationRepository);
  await apprepo.deleteAll();

  const adcrepo = await wafapp.getRepository(AdcRepository);
  await adcrepo.deleteAll();

  const tenantRepo = await wafapp.getRepository(TenantAssociationRepository);
  await tenantRepo.deleteAll();

  const serviceRepo = await wafapp.getRepository(ServiceRepository);
  await serviceRepo.deleteAll();

  const poolRepo = await wafapp.getRepository(PoolRepository);
  await poolRepo.deleteAll();

  const memberRepo = await wafapp.getRepository(MemberRepository);
  await memberRepo.deleteAll();
}

export function createWafpolicyObject(data?: Partial<Wafpolicy>) {
  return Object.assign(
    {
      name: 'test waf policy',
      content:
        '<?xml version="1.0" encoding="utf-8"?>' + '<policy>any</policy>',
      shared: false,
      tenant: ['adminz'],
      createdAt: '2019-01-21T05:03:45.502Z',
    },
    data,
  );
}

export async function givenWafpolicyData(
  wafapp: WafApplication,
  data?: Partial<Wafpolicy>,
) {
  const wafpolicyrepo = await wafapp.getRepository(WafpolicyRepository);
  const obj = createWafpolicyObject(data);
  obj.id = uuid();
  return await wafpolicyrepo.create(obj);
}

export function createApplicationObject(data?: Partial<Application>) {
  return Object.assign(
    {
      name: 'test application',
      description: 'application test data',
      declaration: '{"class": "ADC"}',
      status: 'Done',
      createdAt: '2019-01-22T05:03:45.502Z',
      updatedAt: '2019-01-23T05:03:45.502Z',
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
      host: '1.2.3.4',
      port: 8443,
      username: 'admin',
      passphrase: 'admin',
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
  obj.id = uuid();
  return await adcpepo.create(obj);
}

export async function givenTenantAssociationData(
  wafapp: WafApplication,
  data?: Partial<TenantAssociation>,
) {
  const repo = await wafapp.getRepository(TenantAssociationRepository);
  return await repo.create(createTenantAssociationObject(data));
}

export function createTenantAssociationObject(
  data?: Partial<TenantAssociation>,
) {
  return Object.assign(
    {
      tenantId: uuid(),
      adcId: uuid(),
      createdAt: '2019-01-22T05:03:45.502Z',
      updatedAt: '2019-01-23T05:03:45.502Z',
    },
    data,
  );
}

export async function giveServiceData(
  wafapp: WafApplication,
  data?: Partial<Service>,
) {
  const repo = await wafapp.getRepository(ServiceRepository);
  return await repo.create(createServiceObjectWithID(data));
}

export function createServiceObjectWithID(data?: Partial<Service>) {
  return Object.assign(
    {
      id: uuid(),
      class: 'Service_HTTP',
      virtualAddresses: ['10.0.1.11'],
      pool: 'web_pool',
    },
    data,
  );
}

export function createServiceObjectWithoutID(data?: Partial<Service>) {
  return Object.assign(
    {
      class: 'Service_HTTP',
      virtualAddresses: ['10.0.1.11'],
      pool: 'web_pool',
    },
    data,
  );
}

export async function givenPoolData(
  wafapp: WafApplication,
  data?: Partial<Pool>,
) {
  const repo = await wafapp.getRepository(PoolRepository);
  return await repo.create(createPoolObjectWithID(data));
}

export function createPoolObjectWithID(data?: Partial<Pool>) {
  return Object.assign(
    {
      id: uuid(),
      class: 'Pool',
      loadBalancingMode: 'round-robin',
      members: [uuid(), uuid()],
      monitors: ['http'],
    },
    data,
  );
}

export function createPoolObjectWithoutID(data?: Partial<Pool>) {
  return Object.assign(
    {
      class: 'Pool',
      loadBalancingMode: 'round-robin',
      members: [uuid(), uuid()],
      monitors: ['http'],
    },
    data,
  );
}

export async function givenMemberData(
  wafapp: WafApplication,
  data?: Partial<Member>,
) {
  const repo = await wafapp.getRepository(MemberRepository);
  return await repo.create(createMemberObjectWithID(data));
}

export function createMemberObjectWithID(data?: Partial<Member>) {
  return Object.assign(
    {
      id: uuid(),
      address: '192.0.1.23',
      port: 80,
    },
    data,
  );
}

export function createMemberObjectWithoutID(data?: Partial<Member>) {
  return Object.assign(
    {
      address: '192.0.1.24',
      port: 80,
    },
    data,
  );
}
