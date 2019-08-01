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
import {ResponseWith} from '../../datasources/testrest.datasource';

export class MockBigipController extends MockBaseController {
  @get('/mgmt/tm/sys')
  async sysInfo(): Promise<object> {
    return await ResponseWith.bigip_get_mgmt_tm_sys!();
  }

  @get('/mgmt/tm/net/interface')
  async netInterfaces(): Promise<object> {
    return await ResponseWith.bigip_get_mgmt_tm_net_interface!();
  }

  @get('/mgmt/tm/net/vlan')
  async netVlans(): Promise<object> {
    return await ResponseWith.bigip_get_mgmt_tm_net_vlan!();
  }
  @get('/mgmt/tm/net/self')
  async netSelfs(): Promise<object> {
    return await ResponseWith.bigip_get_mgmt_tm_net_self!();
  }

  @get('/mgmt/tm/sys/global-settings')
  async globalSettings(): Promise<object> {
    return await ResponseWith.bigip_get_mgmt_tm_sys_global_settings!();
  }

  @get('/mgmt/tm/sys/license')
  async license(): Promise<object> {
    return await ResponseWith.bigip_get_mgmt_tm_sys_license!();
  }

  @get('/mgmt/tm/cm/device')
  async cmDevice(): Promise<object> {
    return await ResponseWith.bigip_get_mgmt_tm_cm_device!();
  }

  @get('/mgmt/shared/appsvcs/info')
  async as3Info(): Promise<object> {
    return await ResponseWith.bigip_get_mgmt_shared_appsvcs_info!();
  }

  @get('/mgmt/shared/declarative-onboarding/info')
  async doInfo(): Promise<object> {
    let s = statusDOReady.shift();
    return await ResponseWith.bigip_get_mgmt_shared_declarative_onboarding_info!(
      s,
    );
  }

  @post('/mgmt/shared/file-transfer/uploads/{filename}')
  async doUpload(
    @param.path.string('filename') filename: string,
  ): Promise<object> {
    return await ResponseWith.bigip_post_mgmt_shared_file_transfer_uploads_filename!();
  }

  @post('/mgmt/shared/iapp/package-management-tasks')
  async doInstall(): Promise<object> {
    return await ResponseWith.bigip_post_mgmt_shared_iapp_package_management_tasks!();
  }
  @get('/mgmt/shared/iapp/package-management-tasks/{taskid}')
  async doInstallStatus(): Promise<object> {
    return await ResponseWith.bigip_get_mgmt_shared_iapp_package_management_tasks_taskId!();
  }
  @get('/mgmt/tm/sys/folder/~{partition}')
  async partitionInfo(
    @param.path.string('partition') partition: string,
  ): Promise<object> {
    return await ResponseWith.bigip_get_mgmt_tm_sys_folder__partition!();
  }
}

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
