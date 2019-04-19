import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {DoDataSource} from '../datasources';

export interface DOService {
  doRest(
    method: string,
    url: string,
    headers: object,
    body: object,
  ): Promise<object>;
}

export class DOServiceProvider implements Provider<DOService> {
  constructor(
    // do must match the name property in the datasource json file
    @inject('datasources.do')
    protected dataSource: DoDataSource = new DoDataSource(),
  ) {}

  value(): Promise<DOService> {
    return getService(this.dataSource);
  }
}

export class OnboardingManager {
  private doService: DOService;
  private doBody: TypeDOClassDO;

  constructor(doS: DOService) {
    this.doService = doS;

    // initial/default values for doBody
  }

  async onboarding(givenDoBody: TypeDOClassDO) {
    this.doBody = Object.assign(this.doBody, givenDoBody);
    // TODO: insert credential in headers
    let headers = {};

    try {
      await this.doService
        .doRest(
          'POST',
          'http://do-server:8081/mgmt/shared/declarative-onboarding',
          headers,
          this.doBody,
        )
        .then(
          response => {
            // if onboarding succeeds.
          },
          reason => {
            // if onboarding fails.
          },
        );
    } catch (error) {
      // do error catching.
    }
  }
}

// remote.schema
type TypeDOClassDO = {
  class: 'DO';
  targetHost?: string;
  targetPort?: number;
  targetUsername?: string;
  targetPassphrase?: string;
  targetTokens?: string | {[key: string]: string};
  targetTimeout?: string;
  declaration: TypeDOClassDeclaration;
};

// base.schema
type TypeDOClassDeclaration = {
  schemaVersion: string; // "1.3.0", "1.2.0", "1.1.0", "1.0.0"
  class: 'Device';
  async?: boolean;
  label?: string;
  Credentials?: {tokens: string} | {username: string; password: string}[];
  Common?: {
    class: 'Tenant';
    hostname?: string;
    [key: string]:
      | undefined
      | string
      | TypeDOClassSystemSchema
      | TypeDOClassNetworkSchema
      | TypeDOClassDSCSchema;
  };
  result?: {
    class: 'Result';
    code: 'OK' | 'ERROR';
    message?: string;
  };
};

// dsc.schema
type TypeDOClassDSCSchema =
  | TypeDOClassConfigSync
  | TypeDOClassFailoverUnicast
  | TypeDOClassDeviceGroup
  | TypeDOClassDeviceTrust;

type TypeDOClassConfigSync = {
  class: 'ConfigSync';
  configsyncIp: string;
};

type TypeDOClassFailoverUnicast = {
  class: 'FailoverUnicast';
  address: string;
  port?: number;
};

type TypeDOClassDeviceGroup = {
  /**
   *
    "if": { "properties": { "type": { "const": "sync-failover" } } },
    "then": {
        "if": { "properties": { "autoSync": { "const": true } } },
        "then": {
            "properties": {
                "fullLoadOnSync": {
                    "const": false
                }
            }
        }
    },
   */
  class: 'DeviceGroup';
  type: 'sync-failover' | 'sync-only';
  owner?: string;
  members?: string[];
  autoSync?: boolean;
  saveOnAutoSync?: boolean;
  networkFailover?: boolean;
  asmSync?: boolean;
  fullLoadOnSync?: boolean;
};

type TypeDOClassDeviceTrust = {
  class: 'DeviceTrust';
  localUsername: string;
  localPassword: string;
  remoteHost: string;
  remoteUsername: string;
  remotePassword: string;
};

// network.schema

type TypeDOClassNetworkSchema =
  | TypeDOClassVLAN
  | TypeDOClassSelfIp
  | TypeDOClassRoute;

type TypeDOClassVLAN = {
  class: 'VLAN';
  interfaces: {
    name: string;
    tagged?: boolean;
  }[];
  mtu?: number;
  tag?: number;
};

type TypeDOClassSelfIp = {
  class: 'SelfIp';
  address: string;
  vlan: string;
  trafficGroup?: 'traffic-group-local-only' | 'traffic-group-1';
  allowService?: ('all' | 'none' | 'default') | string[];
};

type TypeDOClassRoute = {
  class: 'Route';
  gw: string;
  network?: 'default' | 'default-inet6';
  mtu?: number;
};

// system.schema
type TypeDOClassSystemSchema =
  | TypeDOClassLicense
  | TypeDOClassDbVariables
  | TypeDOClassProvision
  | TypeDOClassDNS
  | TypeDOClassNTP
  | TypeDOClassUser
  | TypeDOClassPartitionAccess
  | TypeDOClassRegkeyInfo
  | TypeDOClassLicensePoolInfo
  | TypeDOClassbigIqHostInfo;

type TypeDOClassLicense = TypeDOClassRegkeyInfo | TypeDOClassLicensePoolInfo;

type TypeDOClassDbVariables = {
  class: 'DbVariables';
  [key: string]: string | undefined;
};

type TypeDOClassProvision = {
  class: 'Provision';
  // support them on demand.
  // 'afm' | 'am' | 'apm' | 'asm' | 'avr' | 'dos' | 'fps' |
  // 'gtm' | 'ilx' | 'lc' | 'ltm' | 'pem' | 'swg' | 'urldb'
  ltm: 'dedicated' | 'nominal' | 'minimum' | 'none';
  asm: 'dedicated' | 'nominal' | 'minimum' | 'none';
  ilx: 'dedicated' | 'nominal' | 'minimum' | 'none';
};

type TypeDOClassDNS = {
  class: 'DNS';
  nameServers?: string[];
  search?: string[];
};

type TypeDOClassNTP = {
  class: 'NTP';
  servers: string[];
  timezone: string;
};

type TypeDOClassUser = TypeDOClassUserRoot | TypeODClassUserElse;

type TypeDOClassUserRoot = {
  class: 'User';
  userType: 'root';
  newPassword: string;
  oldPassword: string;
};

type TypeODClassUserElse = {
  class: 'User';
  userType: string;
  password?: string;
  partitionAccess?: {
    Common: TypeDOClassPartitionAccess;
    'all-partitions': TypeDOClassPartitionAccess;
  };
  shell: 'bash' | 'tmsh' | 'none';
};

type TypeDOClassPartitionAccess = {
  role:
    | 'admin'
    | 'auditor'
    | 'guest'
    | 'manager'
    | 'operator'
    | 'user-manager'
    | 'application-editor'
    | 'certificate-manager'
    | 'irule-manager'
    | 'no-access'
    | 'resource-admin';
};

type TypeDOClassRegkeyInfo = {
  class: 'License';
  licenseType: 'regKey';
  regKey: string;
  addOnKeys?: string[];
  overwrite?: boolean;
};

type TypeDOClassLicensePoolInfo = {
  class: 'License';
  licenseType: 'licensePool';

  reachable?: boolean;

  licensePool?: string;
  hypervisor?: 'aws' | 'azure' | 'gce' | 'vmware' | 'hyperv' | 'kvm' | 'xen';
  bigIpUsername?: string;
  bigIpPassword?: string;

  skuKeyword1?: string;
  skuKeyword2?: string;
  unitOfMeasure?: 'yearly' | 'monthly' | 'daily' | 'hourly';

  overwrite?: boolean;
  revokeFrom?: string | TypeDOClassRevokeFromObject;
  [key: string]:
    | TypeDOClassCommonTypes
    | TypeDOClassbigIqHostInfo
    | TypeDOClassRevokeFromObject;
};

type TypeDOClassbigIqHostInfo = {
  bigIqHost: string;
  bigIqUsername: string;
  bigIqPassword?: string;
  bigIqPasswordUri?: string;
  reachable?: boolean;
};

type TypeDOClassRevokeFromObject = {
  licensePool: string;
  [key: string]: TypeDOClassbigIqHostInfo | string;
};

type TypeDOClassCommonTypes = undefined | string | boolean | number;
