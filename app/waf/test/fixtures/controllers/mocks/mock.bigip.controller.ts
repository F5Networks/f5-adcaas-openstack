import {MockBaseController} from './mock.base.controller';
import {get} from '@loopback/rest';
import {StubResponses} from '../../datasources/testrest.datasource';

export class MockBigipController extends MockBaseController {
  @get('/mgmt/tm/sys')
  async sysInfo(): Promise<object> {
    return await ResponseWith['/mgmt/tm/sys']();
  }

  @get('/mgmt/tm/net/interface')
  async netInterfaces(): Promise<object> {
    return await ResponseWith['/mgmt/tm/net/interface']();
  }

  @get('/mgmt/tm/net/vlan')
  async netVlans(): Promise<object> {
    return await ResponseWith['/mgmt/tm/net/vlan']();
  }
  @get('/mgmt/tm/net/self')
  async netSelfs(): Promise<object> {
    return await ResponseWith['/mgmt/tm/net/self']();
  }

  @get('/mgmt/tm/sys/global-settings')
  async globalSettings(): Promise<object> {
    return await ResponseWith['/mgmt/tm/sys/global-settings']();
  }

  @get('/mgmt/tm/sys/license')
  async license(): Promise<object> {
    return await ResponseWith['/mgmt/tm/sys/license']();
  }

  @get('/mgmt/tm/cm/device')
  async cmDevice(): Promise<object> {
    return await ResponseWith['/mgmt/tm/cm/device']();
  }
}

let ResponseWith: {[key: string]: Function} = {};

//TODO combine it with the one in openstack.
export function BigipShouldResponseWith(spec: {[key: string]: Function}) {
  ResponseWith = {
    '/mgmt/tm/sys': StubResponses.bigipMgmtSys200,
    '/mgmt/tm/net/interface': StubResponses.bigipNetInterfaces200,
    '/mgmt/tm/net/self': StubResponses.bigipnetSelfips200,
    '/mgmt/tm/net/vlan': StubResponses.bigipNetVlans200,
    '/mgmt/tm/sys/global-settings': StubResponses.bigipGlobalSettings200,
    '/mgmt/tm/sys/license': StubResponses.bigipLiense200,
    '/mgmt/tm/cm/device': StubResponses.bigipCmDevice200,
  };
  Object.assign(ResponseWith, spec);
}
