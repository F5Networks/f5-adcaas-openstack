import {
  setupEnvs,
  teardownDepApps,
  setupDepApps,
} from '../helpers/testsetup-helper';
import {BigipBuiltInProperties, AuthedToken} from '../../src/services';
import {setDefaultInterval} from '../../src/utils';
import {createAdcObject} from '../helpers/database.helpers';
import {expect} from '@loopback/testlab';
import {AdcStateCtrlr, AddonReqValues} from '../../src/controllers';
import {Adc} from '../../src/models';
import {stubLogger, restoreLogger} from '../helpers/logging.helpers';
import {
  RestApplicationPort,
  StubResponses,
  LetResponseWith,
  ExpectedData,
} from '../fixtures/datasources/testrest.datasource';

type CheckEntry = {
  src: string;
  dst: string;
  exp: boolean;
};

describe('test AdcStateCtrlr', () => {
  let addonReq: AddonReqValues;

  before(async () => {
    await setupDepApps();

    BigipBuiltInProperties.port = RestApplicationPort.SSLCustom;
    setDefaultInterval(1);
    setupEnvs();

    addonReq = {
      userToken: AuthedToken.buildWith({
        body: [StubResponses.v2AuthToken200()],
      }),
    };
    stubLogger();
  });
  beforeEach(() => {
    LetResponseWith();
  });
  afterEach(() => {});
  after(async () => {
    restoreLogger();
    await teardownDepApps();
  });

  let buildCheck = function(s: string): CheckEntry {
    let els = s.split(' ');
    return {
      src: els[0],
      dst: els[2],
      exp: els[3] === '✓',
    };
  };

  let myit = function(title: string, adcObj: object, condition?: Function) {
    it(title, async () => {
      if (condition) await condition!();
      let check = buildCheck(title);
      let adc = <Adc>(
        createAdcObject(Object.assign(adcObj, {status: check.src}))
      );
      let adcStCtr = new AdcStateCtrlr(adc, addonReq);
      if (title.includes('->'))
        expect(await adcStCtr.readyTo(check.dst)).eql(check.exp);
      else if (title.includes('+>'))
        expect(await adcStCtr.gotTo(check.dst)).eql(check.exp);
    });
  };

  //let statuses = Object.keys(AdcState);

  myit('NEW -> POWERON ✓', {});
  // myit('POWERON -> DOINSTALLED ✓', {
  //   management: {
  //     connection: {
  //       ipAddress: ExpectedData.networks.management.ipAddr,
  //       tcpPort: ExpectedData.bigipMgmt.tcpPort,
  //       username: BigipBuiltInProperties.admin,
  //       password: 'admin',
  //     },
  //   },
  // });

  // myit('DOINSTALLED -> ONBOARDED ✓', {
  //   management: {
  //     connection: {
  //       ipAddress: ExpectedData.networks.management.ipAddr,
  //       tcpPort: ExpectedData.bigipMgmt.tcpPort,
  //       username: BigipBuiltInProperties.admin,
  //       password: 'admin',
  //     },
  //   },
  // });

  myit('POWERON -> ONBOARDED ✓', {
    management: {
      connection: {
        ipAddress: ExpectedData.networks.management.ipAddr,
        tcpPort: ExpectedData.bigipMgmt.tcpPort,
        username: BigipBuiltInProperties.admin,
        password: 'admin',
      },
    },
  });

  myit(
    'ONBOARDED -> TRUSTED ✓',
    {
      id: ExpectedData.adcId,
      management: {
        connection: {
          ipAddress: ExpectedData.networks.management.ipAddr,
          tcpPort: ExpectedData.bigipMgmt.tcpPort,
          username: BigipBuiltInProperties.admin,
          password: 'admin',
        },
      },
    },
    () => {
      ExpectedData.bigipMgmt.hostname = ExpectedData.adcId + '.openstack.local';
    },
  );

  myit('TRUSTED -> INSTALLED ✓', {
    management: {
      connection: {
        ipAddress: ExpectedData.networks.management.ipAddr,
        tcpPort: ExpectedData.bigipMgmt.tcpPort,
        username: BigipBuiltInProperties.admin,
        password: 'admin',
      },
      trustedDeviceId: ExpectedData.trustDeviceId,
    },
  });

  myit('INSTALLED -> PARTITIONED ✓', {
    management: {
      connection: {
        ipAddress: ExpectedData.networks.management.ipAddr,
        tcpPort: ExpectedData.bigipMgmt.tcpPort,
        username: BigipBuiltInProperties.admin,
        password: 'admin',
      },
      trustedDeviceId: ExpectedData.trustDeviceId,
    },
  });

  myit('PARTITIONED -> ACTIVE ✓', {
    tenantId: ExpectedData.tenantId,
    management: {
      connection: {
        ipAddress: ExpectedData.networks.management.ipAddr,
        tcpPort: ExpectedData.bigipMgmt.tcpPort,
        username: BigipBuiltInProperties.admin,
        password: 'admin',
      },
    },
  });

  myit('ACTIVE -> RECLAIMED ✓', {
    management: {},
  });
  myit('RECLAIMED -> POWERON ✓', {
    management: {
      connection: null,
      vmId: null,
      networks: null,
      trustedDeviceId: null,
    },
  });

  myit('ONBOARDERROR -> ONBOARDED ✓', {
    management: {
      connection: {
        ipAddress: ExpectedData.networks.management.ipAddr,
        tcpPort: ExpectedData.bigipMgmt.tcpPort,
        username: BigipBuiltInProperties.admin,
        password: 'admin',
      },
    },
  });

  myit('ONBOARDERROR -> RECLAIMED ✓', {
    management: {
      connection: {
        ipAddress: ExpectedData.networks.management.ipAddr,
        tcpPort: ExpectedData.bigipMgmt.tcpPort,
        username: BigipBuiltInProperties.admin,
        password: 'admin',
      },
    },
  });

  myit('RECLAIMED +> RECLAIMED ✓', {
    management: {
      connection: null,
      vmId: null,
      trustDeviceId: null,
      networks: null,
    },
  });

  myit('TRUSTED -> INSTALLED x : missing trustedDeviceId', {
    management: {
      connection: {
        ipAddress: ExpectedData.networks.management.ipAddr,
        tcpPort: ExpectedData.bigipMgmt.tcpPort,
        username: BigipBuiltInProperties.admin,
        password: 'admin',
      },
      trustedDeviceId: null,
    },
  });

  myit('PARTITIONED -> ACTIVE x : missing tenantId', {
    management: {
      connection: {
        ipAddress: ExpectedData.networks.management.ipAddr,
        tcpPort: ExpectedData.bigipMgmt.tcpPort,
        username: BigipBuiltInProperties.admin,
        password: 'admin',
      },
    },
  });

  myit('RECLAIMED -> POWERON x : existing connection.', {
    management: {
      connection: {
        ipAddress: ExpectedData.networks.management.ipAddr,
        tcpPort: ExpectedData.bigipMgmt.tcpPort,
        username: BigipBuiltInProperties.admin,
        password: 'admin',
      },
    },
  });

  myit('RECLAIMED -> POWERON x : existing vmId.', {
    management: {
      vmId: ExpectedData.vmId,
      connection: null,
      trustedDeviceId: null,
      networks: null,
    },
  });

  myit('RECLAIMED -> POWERON x : existing trust.', {
    management: {
      trustedDeviceId: ExpectedData.trustDeviceId,
      connection: null,
      vmId: null,
      networks: null,
    },
  });

  myit('RECLAIMED -> POWERON x : existing networks.', {
    management: {
      connection: null,
      trustedDeviceId: null,
      vmId: null,
      networks: {
        mgmt1: {
          fixedIp: ExpectedData.networks.management.ipAddr,
          macAddr: ExpectedData.networks.management.macAddr,
          portId: ExpectedData.networks.management.portId,
        },
      },
    },
  });

  myit('RECLAIMED -> POWERON x: exists connection', {
    management: {
      connection: {},
      vmId: null,
      trustedDeviceId: null,
      networks: null,
    },
  });

  myit('INSTALLED -> PARTITIONED x: missing trustedDeviceId', {
    management: {
      connection: {
        ipAddress: ExpectedData.networks.management.ipAddr,
        tcpPort: ExpectedData.bigipMgmt.tcpPort,
        username: BigipBuiltInProperties.admin,
        password: 'admin',
      },
      //trustedDeviceId: ExpectedData.trustDeviceId,
    },
  });

  myit('INSTALLED -> PARTITIONED x: missing connection', {
    management: {
      connection: null,
    },
  });

  myit('INSTALLERROR -> PARTITIONED x: cannot goon', {
    management: {},
  });

  myit('NEW -> ONBOARDED x : poweron fist.', {});

  myit('RECLAIMED +> RECLAIMED x : existing vmId', {
    management: {
      vmId: ExpectedData.vmId,
    },
  });

  myit(
    'INSTALLED +> INSTALLED x: exception when get as3info',
    {
      management: {
        connection: {
          ipAddress: ExpectedData.networks.management.ipAddr,
          tcpPort: ExpectedData.bigipMgmt.tcpPort,
          username: BigipBuiltInProperties.admin,
          password: 'admin',
        },
        trustedDeviceId: ExpectedData.trustDeviceId,
      },
    },
    () => {
      LetResponseWith({
        bigip_get_mgmt_shared_appsvcs_info: StubResponses.bigipAS3Info404,
      });
    },
  );
});
