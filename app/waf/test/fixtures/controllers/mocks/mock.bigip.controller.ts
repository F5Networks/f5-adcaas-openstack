import {MockBaseController} from './mock.base.controller';
import {get} from '@loopback/rest';
import {StubResponses} from '../../datasources/testrest.datasource';

export class MockBigipController extends MockBaseController {
  @get('/mgmt/tm/sys')
  async sysInfo(): Promise<object> {
    return await ResponseWith['/mgmt/tm/sys']();
  }
}

let ResponseWith: {[key: string]: Function} = {};

//TODO combine it with the one in openstack.
export function BigipShouldResponseWith(spec: {[key: string]: Function}) {
  ResponseWith = {
    '/mgmt/tm/sys': StubResponses.bigipMgmtSys200,
  };
  Object.assign(ResponseWith, spec);
}
