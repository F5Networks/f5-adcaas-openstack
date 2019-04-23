import {MockBaseController} from './mock.base.controller';
import {post} from '@loopback/rest';
import {StubResponses} from '../../datasources/testrest.datasource';

export class MockDOController extends MockBaseController {
  @post('/mgmt/shared/declarative-onboarding')
  async sysInfo(): Promise<object> {
    return await ResponseWith['/mgmt/shared/declarative-onboarding']();
  }
}

let ResponseWith: {[key: string]: Function} = {};

//TODO combine it with the one in openstack.
export function DOShouldResponseWith(spec: {[key: string]: Function}) {
  ResponseWith = {
    '/mgmt/shared/declarative-onboarding': StubResponses.onboardingSucceed200,
  };
  Object.assign(ResponseWith, spec);
}
