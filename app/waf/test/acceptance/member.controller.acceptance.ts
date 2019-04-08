import {Client, expect} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenMemberData,
  givenPoolData,
  createMemberObject,
} from '../helpers/database.helpers';
import uuid = require('uuid');

describe('MemberController', () => {
  let wafapp: WafApplication;
  let client: Client;

  const prefix = '/adcaas/v1';

  before('setupApplication', async () => {
    ({wafapp, client} = await setupApplication());
  });
  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
  });

  after(async () => {
    await teardownApplication(wafapp);
  });

  it('post ' + prefix + '/pools/{pool_id}/members', async () => {
    const pool = await givenPoolData(wafapp);
    const member = createMemberObject({id: uuid()});

    const response = await client
      .post(prefix + `/pools/${pool.id}/members`)
      .send(member)
      .expect(200);

    expect(response.body.member.id)
      .to.not.empty()
      .and.type('string');
  });

  it('get ' + prefix + '/pools/{pool_id}/members/{member_id}', async () => {
    const pool = await givenPoolData(wafapp);
    const member = await givenMemberData(wafapp, {id: uuid(), poolId: pool.id});

    const response = await client
      .get(prefix + `/pools/${pool.id}/members/${member.id}`)
      .expect(200);

    expect(response.body.members[0].id)
      .to.not.empty()
      .and.type('string');
  });

  it('get ' + prefix + '/pools/{pool_id}/members', async () => {
    const pool = await givenPoolData(wafapp);
    await givenMemberData(wafapp, {id: uuid(), poolId: pool.id});
    await givenMemberData(wafapp, {id: uuid(), poolId: pool.id});

    const response = await client
      .get(prefix + `/pools/${pool.id}/members`)
      .expect(200);
    expect(response.body.members)
      .be.instanceOf(Array)
      .and.have.length(2);
  });

  it('delete ' + prefix + '/pools/{pool_id}/members/{member_id}', async () => {
    const pool = await givenPoolData(wafapp);
    const member = await givenMemberData(wafapp, {id: uuid(), poolId: pool.id});

    await client
      .del(prefix + `/pools/${pool.id}/members/${member.id}`)
      .expect(204);

    await client
      .get(prefix + `/pools/${pool.id}/members/${member.id}`)
      .expect(200);
  });

  it('patch ' + prefix + '/pools/{pool_id}/members/{member_id}', async () => {
    const pool = await givenPoolData(wafapp);
    const memberInDb = await givenMemberData(wafapp, {
      id: uuid(),
      poolId: pool.id,
    });
    const member = createMemberObject({
      id: memberInDb.id,
      port: 4789,
    });

    await client
      .patch(prefix + `/pools/${pool.id}/members/${member.id}`)
      .send(member)
      .expect(204);
  });
});
