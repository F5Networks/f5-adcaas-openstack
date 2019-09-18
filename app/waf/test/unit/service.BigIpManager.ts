import {
  setupDepApps,
  setupEnvs,
  teardownDepApps,
  teardownEnvs,
} from '../helpers/testsetup-helper';
import {BigIpManager, BigipBuiltInProperties} from '../../src/services';
import {
  ExpectedData,
  LetResponseWith,
  StubResponses,
} from '../fixtures/datasources/testrest.datasource';
import {expect} from '@loopback/testlab';

import {setDefaultInterval} from '../../src/utils';
import {stubLogger, restoreLogger} from '../helpers/logging.helpers';

describe('test BigIpManager', async () => {
  let bigipMgr: BigIpManager;

  let createDOFile = function() {
    let fs = require('fs');
    fs.writeFileSync(process.env.DO_RPM_PACKAGE!, 'abcd', {
      recursive: true,
    });
  };
  let removeDOFile = function() {
    let fs = require('fs');
    fs.unlinkSync(process.env.DO_RPM_PACKAGE!);
  };

  before('preworks..', async () => {
    stubLogger();
    await setupEnvs();
    await setupDepApps();
    setDefaultInterval(1);
  });

  beforeEach('create bigip mgr.', async () => {
    LetResponseWith();
    bigipMgr = await BigIpManager.instanlize(
      {
        ipAddr: ExpectedData.networks.management.ipAddr,
        password: 'admin',
        port: ExpectedData.bigipMgmt.tcpPort,
        username: BigipBuiltInProperties.admin,
      },
      ExpectedData.requestId,
    );
  });

  after('preworks..', async () => {
    await teardownDepApps();
    await teardownEnvs();
    restoreLogger();
  });

  it('getSys: ok', async () => {
    let response = await bigipMgr.getSys();
    expect(response).hasOwnProperty('items');
  });

  it('getInterfaces: ok', async () => {
    let response = await bigipMgr.getInterfaces();
    expect(response).hasOwnProperty(ExpectedData.networks.management.macAddr);
  });

  it('getInterfaces: none macAddr', async () => {
    LetResponseWith({
      bigip_get_mgmt_tm_net_interface: StubResponses.bigipNetInterfacesNone200,
    });

    let response = await bigipMgr.getInterfaces();
    expect(response).hasOwnProperty('none');
  });

  it('getInterfacesNoNone: none macAddr exception', async () => {
    LetResponseWith({
      bigip_get_mgmt_tm_net_interface: StubResponses.bigipNetInterfacesNone200,
    });

    try {
      await bigipMgr.getInterfacesNoNone();
      expect('Called').eql('should not happen');
    } catch (error) {
      expect(error.message).eql('bigip mac addresses are not ready to get.');
    }
  });

  it('getLicense: ok', async () => {
    let response = await bigipMgr.getLicense();
    expect(response.registrationKey).eql(ExpectedData.bigipMgmt.licenseKey);
  });

  it('getLicense: malform response', async () => {
    LetResponseWith({
      bigip_get_mgmt_tm_sys_license: StubResponses.emptyResponse,
    });

    try {
      await bigipMgr.getLicense();
      expect('Called').eql('should not happen');
    } catch (error) {
      expect(error.message).startWith('License not found: from ');
    }
  });

  it('getConfigsyncIp: ok', async () => {
    let response = await bigipMgr.getConfigsyncIp();
    expect(response).eql(ExpectedData.networks.ha.ipAddr);
  });

  it('getConfigsyncIp: none configsyncip', async () => {
    LetResponseWith({
      bigip_get_mgmt_tm_cm_device: StubResponses.bigipCmDeviceNone200,
    });

    let response = await bigipMgr.getConfigsyncIp();
    expect(response).eql('none');
  });

  it('getConfigsyncIp: empty exception', async () => {
    LetResponseWith({
      bigip_get_mgmt_tm_cm_device: () => {
        return {items: []};
      },
    });
    try {
      let response = await bigipMgr.getConfigsyncIp();
      expect(response).eql('none');
      expect('Called').eql('should not happen');
    } catch (error) {
      expect(error.message).eql('No configsync IP');
    }
  });

  it('uploadDO: ok', async () => {
    createDOFile();
    let response = await bigipMgr.uploadDO();
    removeDOFile();
    // TODO: It's strange that the response is string.
    // expect(response).hasOwnProperty('localFilePath');
    expect(typeof response).eql('string');
  });

  it('uploadDO: DO file not exists', async () => {
    try {
      await bigipMgr.uploadDO();
      expect('Called').eql('should not happen');
    } catch (error) {
      expect(error.message).startWith("DO RPM file doesn't exist: ");
    }
  });

  it('installDO: ok', async () => {
    let response = await bigipMgr.installDO();
    expect(response).to.eql('FINISHED');
  });

  it('installDO: no FINISHED state returns', async () => {
    LetResponseWith({
      bigip_get_mgmt_shared_iapp_package_management_tasks_taskId:
        StubResponses.bigipDOInstallStatusCreated200,
    });

    try {
      await bigipMgr.installDO();
      expect('Called').eql('should not happen');
    } catch (error) {
      expect(error.message).startWith('Install DO failed:');
    }
  });

  it('installDO: FAILED state', async () => {
    LetResponseWith({
      bigip_get_mgmt_shared_iapp_package_management_tasks_taskId:
        StubResponses.bigipDOInstallStatusFailed200,
    });

    try {
      await bigipMgr.installDO();
      expect('Called').eql('should not happen');
    } catch (error) {
      expect(error.message).startWith('Install DO failed:');
    }
  });

  it('bigip not reachable', async () => {
    bigipMgr = await BigIpManager.instanlize(
      {
        ipAddr: 'bad.ip.address.notexists',
        password: 'admin',
        port: ExpectedData.bigipMgmt.tcpPort,
        username: BigipBuiltInProperties.admin,
        timeout: 200,
      },
      ExpectedData.requestId,
    );

    try {
      await bigipMgr.getSys();
      expect('Called').eql('should not happen');
    } catch (error) {
      expect(error.message).to.startWith(
        'Host unreachable: {"ipaddr":"bad.ip.address.notexists',
      );
    }
  });
});
