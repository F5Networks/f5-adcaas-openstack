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

import {MockBaseController} from './mock.base.controller';
import {get, param, post} from '@loopback/rest';
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

  @get('/mgmt/shared/appsvcs/info')
  async as3Info(): Promise<object> {
    return await ResponseWith['/mgmt/shared/appsvcs/info']();
  }

  @get('/mgmt/shared/declarative-onboarding/info')
  async doInfo(): Promise<object> {
    let s = statusDOReady.shift();
    return await ResponseWith['/mgmt/shared/declarative-onboarding/info'](s);
  }

  @post('/mgmt/shared/file-transfer/uploads/{filename}')
  async doUpload(
    @param.path.string('filename') filename: string,
  ): Promise<object> {
    return await ResponseWith[
      '/mgmt/shared/file-transfer/uploads/{filename}'
    ]();
  }

  @post('/mgmt/shared/iapp/package-management-tasks')
  async doInstall(): Promise<object> {
    return await ResponseWith['/mgmt/shared/iapp/package-management-tasks']();
  }
  @get('/mgmt/shared/iapp/package-management-tasks/{taskid}')
  async doInstallStatus(): Promise<object> {
    return await ResponseWith[
      '/mgmt/shared/iapp/package-management-tasks/{taskid}'
    ]();
  }
  @get('/mgmt/tm/sys/folder/~{partition}')
  async partitionInfo(
    @param.path.string('partition') partition: string,
  ): Promise<object> {
    return await ResponseWith['/mgmt/tm/sys/folder/~{partition}']();
  }
}

let ResponseWith: {[key: string]: Function} = {};
let statusDOReady = [
  'FAILED',
  'OK',
  'OK',
  'OK',
  'OK',
  'OK',
  'OK',
  'OK',
  'OK',
  'OK',
  'OK',
  'OK',
  'OK',
];
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
    '/mgmt/shared/appsvcs/info': StubResponses.bigipAS3Info200,
    '/mgmt/tm/sys/folder/~{partition}': StubResponses.bigipPartition200,
    '/mgmt/shared/declarative-onboarding/info': StubResponses.bigipDOInfo200,
    '/mgmt/shared/file-transfer/uploads/{filename}':
      StubResponses.bigipDOUpload200,
    '/mgmt/shared/iapp/package-management-tasks':
      StubResponses.bigipDOInstall200,
    '/mgmt/shared/iapp/package-management-tasks/{taskid}':
      StubResponses.bigipDOInstallstatus200,
  };
  Object.assign(ResponseWith, spec);
}
