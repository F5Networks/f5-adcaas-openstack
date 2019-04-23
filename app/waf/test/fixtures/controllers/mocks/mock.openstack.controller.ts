import {
  post,
  requestBody,
  param,
  get,
  RestBindings,
  RequestContext,
} from '@loopback/rest';
import {RequestBody} from '../openstack.controller';
import {StubResponses} from '../../datasources/testrest.datasource';
import {MockBaseController} from './mock.base.controller';
import {inject} from '@loopback/core';

export class MockKeyStoneController extends MockBaseController {
  constructor(
    @inject(RestBindings.Http.CONTEXT)
    private ctx: RequestContext,
  ) {
    super();
  }
  @post('/v2.0/tokens')
  async v2AuthToken(@requestBody() reqBody: RequestBody): Promise<object> {
    return ResponseWith['/v2.0/tokens']();
  }

  @get('/v2.0/tokens/{tokenId}')
  async v2ValidateToken(
    @param.path.string('tokenId') tokenId: string,
    @param.query.string('belongsTo') belongsTo: string,
    @requestBody() reqBody: RequestBody,
  ): Promise<object> {
    return ResponseWith['/v2.0/tokens']();
  }

  @post('/v3/auth/tokens')
  async v3AuthToken(@requestBody() reqBody: RequestBody): Promise<object> {
    this.ctx.response.setHeader('X-Subject-Token', ExpectedData.userToken);
    return ResponseWith['/v3/auth/tokens']();
  }

  @get('/v3/auth/tokens')
  async v3ValidateToken(@requestBody() reqBody: RequestBody): Promise<object> {
    this.ctx.response.setHeader('X-Subject-Token', ExpectedData.userToken);
    return ResponseWith['/v3/auth/tokens']();
  }
}

export class MockNovaController extends MockBaseController {
  @post('/v2/{tenantId}/servers')
  async v2CreateServer(
    @param.path.string('tenantId') tenantId: string,
    @requestBody() reqBody: RequestBody,
  ): Promise<object> {
    return ResponseWith['/v2/{tenantId}/servers']();
  }

  @get('/v2/{tenantId}/servers/{serverId}')
  async v2GetVMDetail(
    @param.path.string('tenantId') tenantId: string,
    @param.path.string('serverId') serverId: string,
    @requestBody() reqBody: RequestBody,
  ): Promise<object> {
    return ResponseWith['/v2/{tenantId}/servers/{serverId}']();
  }
}

export class MockNeutronController extends MockBaseController {
  @post('/v2.0/ports')
  async v2CreatePort(@requestBody() reqBody: RequestBody): Promise<object> {
    return ResponseWith['/v2.0/ports']();
  }

  @get('/v2.0/subnets')
  async v2GetSubnets(): Promise<object> {
    return ResponseWith['/v2.0/subnets']();
  }
}

let ResponseWith: {[key: string]: Function} = {};

export function ShouldResponseWith(spec: {[key: string]: Function}) {
  ResponseWith = {
    '/v2.0/tokens': StubResponses.v2AuthToken200,
    '/v3/auth/tokens': StubResponses.v3AuthToken200,
    '/v2.0/ports': StubResponses.neutronCreatePort200,
    '/v2.0/subnets': StubResponses.neutronGetSubnets200,
    '/v2/{tenantId}/servers': StubResponses.novaCreateVM200,
    '/v2/{tenantId}/servers/{serverId}': StubResponses.novaGetVMDetail200,
  };
  Object.assign(ResponseWith, spec);
}

export const ExpectedData = {
  userToken: '8cf3d2447253455385c36254192cc4fe',
  userId: '2d26c96aa0f345eaafc3f5b50d2bbd8e',
  serverId: 'fef1e40c-ed9d-4e10-b10c-d60d3af70623',
  portId: 'fcc768fd-1439-48f2-b2df-6d7e867c86a7',
  tenantId: 'fdac59f5b20046829ea58720702a74af',
  bigipMgmt: {
    hostname: 'test-asm.example1234.openstack.com',
    macAddr: 'fa:16:3e:a2:25:bc',
    ipAddr: '10.1.1.245',
    ipPoolCIDR: '10.1.1.0/24',
    networkId: '0e51e68c-08f7-4e32-af54-328d29b93467',
  },
};
