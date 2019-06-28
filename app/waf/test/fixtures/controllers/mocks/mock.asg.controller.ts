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

import {post, requestBody, param, get, del, put} from '@loopback/rest';
import {StubResponses} from '../../datasources/testrest.datasource';
import {MockBaseController} from './mock.base.controller';

export class MockASGController extends MockBaseController {
  @post('/mgmt/shared/TrustedProxy')
  async trustedProxyPost(@requestBody() reqBody: object): Promise<object> {
    return ResponseWith['POST:/mgmt/shared/TrustedProxy']();
  }

  @get('/mgmt/shared/TrustedDevices/{deviceId}')
  async queryTrustDevice(
    @param.path.string('deviceId') id: string,
  ): Promise<object> {
    let s = statusTrustDevice.shift();
    return ResponseWith['GET:/mgmt/shared/TrustedDevices/{deviceId}'](s);
  }

  @put('/mgmt/shared/TrustedDevices')
  async putTrustDevice(@requestBody() body: object): Promise<object> {
    return ResponseWith['PUT:/mgmt/shared/TrustedDevices']();
  }

  @get('/mgmt/shared/TrustedDevices')
  async getTrustDevices(@requestBody() body: object): Promise<object> {
    return ResponseWith['GET:/mgmt/shared/TrustedDevices']();
  }

  @del('/mgmt/shared/TrustedDevices/{deviceId}')
  async untrustDevice(
    @param.path.string('deviceId') id: string,
  ): Promise<object> {
    return ResponseWith['DEL:/mgmt/shared/TrustedDevices/{deviceId}']();
  }

  @post('/mgmt/shared/TrustedExtensions/{deviceId}')
  async installExtension(
    @param.path.string('deviceId') id: string,
    @requestBody() body: object,
  ): Promise<object> {
    return ResponseWith['POST:/mgmt/shared/TrustedExtensions/{deviceId}']();
  }

  @get('/mgmt/shared/TrustedExtensions/{deviceId}')
  async queryExtension(
    @param.path.string('deviceId') id: string,
  ): Promise<object> {
    let s = statusTrustExtension.shift();
    return ResponseWith['GET:/mgmt/shared/TrustedExtensions/{deviceId}'](s);
  }
}

let statusTrustDevice = ['PENDING', 'PENDING', 'ACTIVE'];
let statusTrustExtension = [undefined, 'UPLOADING', 'AVAILABLE'];
let ResponseWith: {[key: string]: Function} = {};

//TODO combine it with the one in openstack.
export function ASGShouldResponseWith(spec: {[key: string]: Function}) {
  ResponseWith = {
    'POST:/mgmt/shared/TrustedProxy': StubResponses.trustProxyDeploy200,
    'GET:/mgmt/shared/TrustedDevices/{deviceId}':
      StubResponses.trustDeviceStatusActive200,
    'PUT:/mgmt/shared/TrustedDevices': StubResponses.trustDeviceStatusActive200,
    'GET:/mgmt/shared/TrustedDevices': StubResponses.trustDevices200,
    'DEL:/mgmt/shared/TrustedDevices/{deviceId}':
      StubResponses.untrustDevice200,
    'POST:/mgmt/shared/TrustedExtensions/{deviceId}':
      StubResponses.installTrustedExtensions200,
    'GET:/mgmt/shared/TrustedExtensions/{deviceId}':
      StubResponses.queryTrustedExtensionsAvailable200,
  };
  Object.assign(ResponseWith, spec);
}
