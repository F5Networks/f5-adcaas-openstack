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
    expect(doMgr.config).containDeep({endpoint: Environments.DO_ENDPOINT});
  });

  it('instanlize: failed because of missing envs', async () => {
    delete process.env.DO_ENDPOINT;

    try {
      await OnboardingManager.instanlize(wafapp);
      expect('call').eql('should not happen.');
    } catch (error) {
      expect(error.message).startWith(
        'Environments should be set: ["DO_ENDPOINT"]',
      );
    }
  });

  it('assembleDo: ok', async () => {
    let adc = <Adc>createAdcObject();
    let response = await doMgr.assembleDo(adc, addon);
    expect(response).containDeep({class: 'DO'});
    expect(response.declaration.Common).hasOwnProperty('root');
  });

  it('assembleDo: ok with no user sshkey', async () => {
    let adc = <Adc>createAdcObject({compute: {sshKey: null}});
    let response = await doMgr.assembleDo(adc, addon);
    expect(response).containDeep({class: 'DO'});
    expect(response.declaration.Common).not.hasOwnProperty('root');
  });

  it('onboard: ok', async () => {
    let adc = <Adc>createAdcObject();
    let dobody = await doMgr.assembleDo(adc, addon);
    let response = await doMgr.onboard(dobody);
    expect(response).eql(ExpectedData.doTaskId);
  });

  it('onboard: post failed with http error.', async () => {
    LetResponseWith({
      do_post_mgmt_shared_declaration_onboarding: StubResponses.response401,
    });
    let adc = <Adc>createAdcObject();
    let dobody = await doMgr.assembleDo(adc, addon);
    try {
      await doMgr.onboard(dobody);
      expect('call').eql('should not happen.');
    } catch (error) {
      expect(error.message).startWith('Failed to onboarding device: ');
    }
  });

  it('isDone: true', async () => {
    let response = await doMgr.isDone(ExpectedData.doTaskId);
    expect(response).eql(true);
  });

  it('isDone: false', async () => {
    LetResponseWith({
      do_get_mgmt_shared_declaration_onboarding_task_taskId:
        StubResponses.onboardingSucceed202,
    });
    let response = await doMgr.isDone(ExpectedData.doTaskId);
    expect(response).eql(false);
  });

  it('isDone: exception while getting', async () => {
    LetResponseWith({
      do_get_mgmt_shared_declaration_onboarding_task_taskId:
        StubResponses.response400,
    });

    try {
      await doMgr.isDone(ExpectedData.doTaskId);
      expect('call').eql('should not happen.');
    } catch (error) {
      expect(error.message).startWith('Failed to query onboarding status: ');
    }
  });
});
