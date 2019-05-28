import {post, requestBody} from '@loopback/rest';
import {StubResponses} from '../../datasources/testrest.datasource';
import {MockBaseController} from './mock.base.controller';

export class ASGController extends MockBaseController {
  @post('/mgmt/shared/TrustedProxy')
  async trustedProxyPost(@requestBody() reqBody: object): Promise<object> {
    return ResponseWith['/mgmt/shared/TrustedProxy']();
  }
}

let ResponseWith: {[key: string]: Function} = {};

//TODO combine it with the one in openstack.
export function ASGShouldResponseWith(spec: {[key: string]: Function}) {
  ResponseWith = {
    '/mgmt/shared/TrustedProxy': StubResponses.trustProxyDeploy200,
  };
  Object.assign(ResponseWith, spec);
}
