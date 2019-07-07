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
import {ResponseWith} from '../../datasources/testrest.datasource';
import {MockBaseController} from './mock.base.controller';

export class MockASGController extends MockBaseController {
  @post('/mgmt/shared/TrustedProxy')
  async trustedProxyPost(@requestBody() reqBody: object): Promise<object> {
    return ResponseWith.asg_post_mgmt_shared_trustproxy!();
  }

  @get('/mgmt/shared/TrustedDevices/{deviceId}')
  async queryTrustDevice(
    @param.path.string('deviceId') id: string,
  ): Promise<object> {
    let s = statusTrustDevice.shift();
    return ResponseWith.asg_get_mgmt_shared_trusteddevices_deviceId!(s);
  }

  @put('/mgmt/shared/TrustedDevices')
  async putTrustDevice(@requestBody() body: object): Promise<object> {
    return ResponseWith.asg_put_mgmt_shared_trusteddevices!();
  }

  @get('/mgmt/shared/TrustedDevices')
  async getTrustDevices(@requestBody() body: object): Promise<object> {
    return ResponseWith.asg_get_mgmt_shared_trusteddevices!();
  }

  @del('/mgmt/shared/TrustedDevices/{deviceId}')
  async untrustDevice(
    @param.path.string('deviceId') id: string,
  ): Promise<object> {
    return ResponseWith.asg_del_mgmt_shared_trusteddevices_deviceId!();
  }

  @post('/mgmt/shared/TrustedExtensions/{deviceId}')
  async installExtension(
    @param.path.string('deviceId') id: string,
    @requestBody() body: object,
  ): Promise<object> {
    return ResponseWith.asg_post_mgmt_shared_trustedextensions_deviceId!();
  }

  @get('/mgmt/shared/TrustedExtensions/{deviceId}')
  async queryExtension(
    @param.path.string('deviceId') id: string,
  ): Promise<object> {
    let s = statusTrustExtension.shift();
    return ResponseWith.asg_get_mgmt_shared_trustedextensions_deviceId!(s);
  }
}

let statusTrustDevice = ['PENDING', 'PENDING', 'ACTIVE'];
let statusTrustExtension = [undefined, 'UPLOADING', 'AVAILABLE'];
