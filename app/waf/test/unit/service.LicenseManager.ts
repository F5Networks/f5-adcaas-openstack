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
  setupDepApps,
  setupEnvs,
  teardownDepApps,
  setupApplication,
  teardownApplication,
} from '../helpers/testsetup-helper';
import {
  BigipBuiltInProperties,
  LicenseManager,
  LicConfig,
} from '../../src/services';
import {
  RestApplicationPort,
  LetResponseWith,
  StubResponses,
  ExpectedData,
} from '../fixtures/datasources/testrest.datasource';
import {setDefaultInterval} from '../../src/utils';
import {instantiateClass} from '@loopback/core';
import {WafApplication} from '../../src';
import {createAdcObject} from '../helpers/database.helpers';
import {Adc} from '../../src/models';
import {expect} from '@loopback/testlab';

describe('test LicenseManager', async () => {
  let wafapp: WafApplication;
  let adc: Adc;

  let createLicMgr = async (a: Adc) => {
    let settings: LicConfig = {
      BIGIQSetting: {
        hostname: process.env.BIGIQ_HOST!,
        username: process.env.BIGIQ_USERNAME!,
        password: process.env.BIGIQ_PASSWORD!,
        poolname: process.env.BIGIQ_POOL!,
      },
      BIGIPSetting: a,
      licenseKey: a.license,
    };
    return await instantiateClass(LicenseManager, wafapp, undefined, [
      settings,
      'any',
      'https://localhost:' + RestApplicationPort.SSLCustom,
      'hello',
    ]);
  };

  before(async () => {
    wafapp = (await setupApplication()).wafapp;
    BigipBuiltInProperties.port = RestApplicationPort.SSLCustom;

    await setupDepApps();
    setDefaultInterval(1);
  });

  beforeEach(async () => {
    adc = <Adc>createAdcObject();
    setupEnvs();
    LetResponseWith();
    delete process.env.LICENSE_ASSIGN;
  });

  afterEach(() => {});

  after(async () => {
    await teardownDepApps();
    await teardownApplication(wafapp);
  });

  it('create LicenseManager failed because of properties missing.', async () => {
    let settings = {BIGIPSetting: adc};
    try {
      await instantiateClass(LicenseManager, wafapp, undefined, [
        settings,
        'any',
        'https://localhost',
        'hello',
      ]);
      expect('should not be here').eql('');
    } catch (error) {
      expect(error.message).eql(
        'Either licenseKey or BIGIQSetting should be non-empty.',
      );
    }
  });

  it('test license() via Key succeed.', async () => {
    adc.license = 'any';
    let response = await createLicMgr(adc).then(lm => lm.license(adc));
    expect(response).eql('response_request_id');
  });

  it('test license() via DO succeed.', async () => {
    process.env.LICENSE_ASSIGN = 'DO';
    let response = await createLicMgr(adc).then(lm => lm.license(adc));
    expect(response).eql(ExpectedData.doTaskId);
  });

  it('test license() via DO failed because of missing ENVs', async () => {
    process.env.LICENSE_ASSIGN = 'DO';
    delete process.env.BIGIQ_HOST;
    try {
      await createLicMgr(adc).then(lm => lm.license(adc));
      expect('should not be here').eql('');
    } catch (error) {
      expect(error.message).eql('settings.hostname cannot be empty!');
    }
  });

  it('test license() via BIG-IQ succeed.', async () => {
    LetResponseWith({
      bigiq_get_assign_or_revoke_task: StubResponses.bigiqAssignTaskFinished200,
    });

    await createLicMgr(adc).then(lm => lm.license(adc));
  });

  it('test unlicense() via DO succeed', async () => {
    it('test license() via DO succeed.', async () => {
      await createLicMgr(adc).then(lm => lm.unLicense(adc));
    });
  });

  it('test unLicense() via Key succeed.', async () => {
    adc.license = 'any';
    await createLicMgr(adc).then(lm => lm.unLicense(adc));
  });
});
