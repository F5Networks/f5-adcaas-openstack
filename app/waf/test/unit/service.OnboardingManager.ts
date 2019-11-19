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
  LetResponseWith,
  Environments,
  RestApplicationPort,
  StubResponses,
  ExpectedData,
} from '../fixtures/datasources/testrest.datasource';
import {
  setupDepApps,
  setupEnvs,
  teardownDepApps,
  teardownEnvs,
  setupApplication,
  teardownApplication,
} from '../helpers/testsetup-helper';
import {setDefaultInterval} from '../../src/utils';
import {
  OnboardingManager,
  BigipBuiltInProperties,
  AuthedToken,
} from '../../src/services';
import {WafApplication} from '../../src';
import {expect} from '@loopback/testlab';
import {createAdcObject} from '../helpers/database.helpers';
import {Adc} from '../../src/models';
import {AddonReqValues} from '../../src/controllers';

describe('test OnboardingManager', async () => {
  let doMgr: OnboardingManager;
  let wafapp: WafApplication;
  let addon: AddonReqValues;
  let adc: Adc;

  before('prework..', async () => {
    await setupEnvs();
    let appAndClient = await setupApplication();
    wafapp = appAndClient.wafapp;

    BigipBuiltInProperties.port = RestApplicationPort.SSLCustom;
    await setupDepApps();
    setDefaultInterval(1);
    addon = {
      userToken: AuthedToken.buildWith({
        body: [StubResponses.v2AuthToken200()],
      }),
    };
  });

  beforeEach('for each.before', async () => {
    LetResponseWith();
    await setupEnvs();
    doMgr = await OnboardingManager.instanlize(wafapp);
    adc = new Adc(createAdcObject());
  });

  afterEach('for each.after', async () => {
    await teardownEnvs();
  });

  after('postwork..', async () => {
    await teardownApplication(wafapp);
    await teardownDepApps();
    await teardownEnvs();
  });

  it('instanlize: ok', async () => {
    expect(doMgr.config).containDeep({
      licPool: {host: Environments.BIGIQ_HOST},
    });
  });

  it('instanlize: failed because of missing envs', async () => {
    delete process.env.BIGIQ_HOST;

    try {
      await OnboardingManager.instanlize(wafapp);
      expect('call').eql('should not happen.');
    } catch (error) {
      expect(error.message).startWith(
        'Environments should be set: ["BIGIQ_HOST"]',
      );
    }
  });

  it('assembleDo: ok', async () => {
    let response = await doMgr.assembleDo(adc, addon);
    expect(response).containDeep({class: 'DO'});
    expect(response.declaration.Common).hasOwnProperty('root');
  });

  it('assembleDo: ok with no user sshkey', async () => {
    adc = <Adc>createAdcObject({compute: {sshKey: null}});
    let response = await doMgr.assembleDo(adc, addon);
    expect(response).containDeep({class: 'DO'});
    expect(response.declaration.Common).not.hasOwnProperty('root');
  });

  it('onboard: ok', async () => {
    doMgr.config.endpoint = adc.getDoEndpoint();
    let dobody = await doMgr.assembleDo(adc, addon);
    let response = await doMgr.onboard(dobody);
    expect(response).eql(ExpectedData.doTaskId);
  });

  it('onboard: post failed with http error.', async () => {
    LetResponseWith({
      bigip_post_mgmt_shared_declaration_onboarding: StubResponses.response401,
    });
    let dobody = await doMgr.assembleDo(adc, addon);
    try {
      await doMgr.onboard(dobody);
      expect('call').eql('should not happen.');
    } catch (error) {
      expect(error.message).startWith('Failed to onboarding device: ');
    }
  });

  it('isDone: true', async () => {
    doMgr.config.endpoint = adc.getDoEndpoint();
    let response = await doMgr.isDone(ExpectedData.doTaskId);
    expect(response).eql(true);
  });

  it('isDone: false', async () => {
    doMgr.config.endpoint = adc.getDoEndpoint();
    LetResponseWith({
      bigip_get_mgmt_shared_declaration_onboarding_task_taskId:
        StubResponses.onboardingSucceed202,
    });
    let response = await doMgr.isDone(ExpectedData.doTaskId);
    expect(response).eql(false);
  });

  it('isDone: exception while getting', async () => {
    doMgr.config.endpoint = adc.getDoEndpoint();
    LetResponseWith({
      bigip_get_mgmt_shared_declaration_onboarding_task_taskId:
        StubResponses.response400,
    });

    try {
      await doMgr.isDone(ExpectedData.doTaskId);
    } catch (error) {
      expect('call').eql('should not happen.');
    }
  });
});
