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

import {ASGManager} from '../../src/services';
import {
  setupEnvs,
  setupDepApps,
  teardownDepApps,
  teardownEnvs,
} from '../helpers/testsetup-helper';
import {
  ExpectedData,
  LetResponseWith,
  StubResponses,
} from '../fixtures/datasources/testrest.datasource';
import {expect} from '@loopback/testlab';
import {stubLogger, restoreLogger} from '../helpers/logging.helpers';

describe('test ASGManager', async () => {
  let asgMgr: ASGManager;

  before('preworks.', async () => {
    setupEnvs();
    stubLogger();
    LetResponseWith();
    await setupDepApps();
  });

  beforeEach('foreach.before', async () => {
    asgMgr = await ASGManager.instanlize();
  });

  after('postworks.', async () => {
    await teardownDepApps();
    restoreLogger();
    teardownEnvs();
  });

  it('getTrustState: ACTIVE', async () => {
    let response = await asgMgr.getTrustState(ExpectedData.trustDeviceId);
    expect(response).eql('ACTIVE');
  });

  it('getTrustState: exception with empty response', async () => {
    LetResponseWith({
      asg_get_mgmt_shared_trusteddevices_deviceId:
        StubResponses.trustDeviceStatusEmpty200,
    });

    try {
      await asgMgr.getTrustState(ExpectedData.trustDeviceId);
      expect('call').eql('should not happen');
    } catch (error) {
      expect(error.message).eql('Trusted device response size is 0');
    }
  });

  it('getAS3State: ok', async () => {
    let response = await asgMgr.getAS3State(ExpectedData.trustDeviceId);
    expect(response).eql('AVAILABLE');
  });

  it('getAS3State: ok but NONE', async () => {
    LetResponseWith({
      asg_get_mgmt_shared_trustedextensions_deviceId:
        StubResponses.queryTrustedExtensionsAS3NotFound200,
    });
    let response = await asgMgr.getAS3State(ExpectedData.trustDeviceId);
    expect(response).eql('NONE');
  });

  it('deploy: failed with http non 200', async () => {
    LetResponseWith({
      asg_post_mgmt_shared_trustproxy:
        StubResponses.installTrustedExtensions400,
    });
    try {
      await asgMgr.deploy(
        ExpectedData.networks.management.ipAddr,
        ExpectedData.bigipMgmt.tcpPort,
        {},
      );
      expect('call').eql('should not happen');
    } catch (error) {
      expect(error.message).startWith('Deployment is something wrong');
    }
  });
});
