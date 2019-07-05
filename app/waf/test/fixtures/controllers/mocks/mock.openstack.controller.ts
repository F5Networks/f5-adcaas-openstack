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
  post,
  requestBody,
  param,
  get,
  RestBindings,
  RequestContext,
  del,
  put,
} from '@loopback/rest';
import {RequestBody} from '../openstack.controller';
import {
  StubResponses,
  ExpectedData,
} from '../../datasources/testrest.datasource';
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
  async v2PostAuthToken(@requestBody() reqBody: RequestBody): Promise<object> {
    return ResponseWith['/v2.0/tokens']();
  }

  @get('/v2.0/tokens')
  async v2GetAuthToken(@requestBody() reqBody: RequestBody): Promise<object> {
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

  @del('/v2/{tenantId}/servers/{serverId}')
  async v2DeleteServer(
    @param.path.string('tenantId') tenantId: string,
    @param.path.string('serverId') serverid: string,
  ): Promise<void> {
    return ResponseWith['DELETE:/v2/{tenantId}/servers/{serverId}']();
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
    //@ts-ignore requestBody containes port object.
    return ResponseWith['/v2.0/ports'](reqBody.port.network_id);
  }

  @del('/v2.0/ports/{portId}')
  async v2DeletePort(
    @param.path.string('portId') portId: string,
  ): Promise<void> {
    return ResponseWith['DELETE:/v2.0/ports/{portId}']();
  }

  @put('/v2.0/ports/{portId}')
  async v2UpdatePort(
    @param.path.string('portId') portId: string,
  ): Promise<void> {
    return ResponseWith['PUT:/v2.0/ports/{portId}']();
  }

  @get('/v2.0/ports/{portId}')
  async v2GetPort(@param.path.string('portId') portId: string): Promise<void> {
    return ResponseWith['GET:/v2.0/ports/{portId}']();
  }

  @get('/v2.0/subnets')
  async v2GetSubnets(
    @param.query.string('network_id') networkId: string,
  ): Promise<object> {
    return ResponseWith['/v2.0/subnets'](networkId);
  }

  @post('/v2.0/floatingips')
  async v2CreateFloatingIp(
    @requestBody() reqBody: RequestBody,
  ): Promise<object> {
    return ResponseWith['POST:/v2.0/floatingips']();
  }

  @get('/v2.0/floatingips')
  async v2GetFloatingIps(): Promise<object> {
    return ResponseWith['GET:/v2.0/floatingips']();
  }

  @put('/v2.0/floatingips/{floatingIpId}')
  async v2UpdateFloatingIp(
    @param.path.string('floatingIpId') portId: string,
  ): Promise<void> {
    return ResponseWith['PUT:/v2.0/floatingips/{floatingIpId}']();
  }

  @del('/v2.0/floatingips/{floatingIpId}')
  async v2DeleteFloatingIp(
    @param.path.string('floatingIpId') floatingIpId: string,
  ): Promise<void> {
    return ResponseWith['DELETE:/v2.0/floatingips/{floatingIpId}']();
  }
}

let ResponseWith: {[key: string]: Function} = {};

export function OSShouldResponseWith(spec: {[key: string]: Function}) {
  ResponseWith = {
    '/v2.0/tokens': StubResponses.v2AuthToken200,
    '/v3/auth/tokens': StubResponses.v3AuthToken200,
    '/v2.0/ports': StubResponses.neutronCreatePort200,
    'DELETE:/v2.0/ports/{portId}': StubResponses.neutronDeletePort200,
    'PUT:/v2.0/ports/{portId}': StubResponses.neutronUpdatePort200,
    'GET:/v2.0/ports/{portId}': StubResponses.neutronGetPort200,
    '/v2.0/subnets': StubResponses.neutronGetSubnets200,
    '/v2/{tenantId}/servers': StubResponses.novaCreateVM200,
    'DELETE:/v2/{tenantId}/servers/{serverId}': StubResponses.novaDeleteVM200,
    '/v2/{tenantId}/servers/{serverId}': StubResponses.novaGetVMDetail200,
    'GET:/v2.0/floatingips': StubResponses.neutronGetFloatingIps200,
    'POST:/v2.0/floatingips': StubResponses.neutronPostFloatingIp201,
    'PUT:/v2.0/floatingips/{floatingIpId}':
      StubResponses.neutronPutFloatingIp200,
    'DELETE:/v2.0/floatingips/{floatingIpId}':
      StubResponses.neutronDeleteFloatingIp204,
  };
  Object.assign(ResponseWith, spec);
}
