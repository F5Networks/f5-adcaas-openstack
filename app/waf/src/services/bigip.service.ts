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

import {Provider, inject} from '@loopback/core';
import {BIGIPDataSource} from '../datasources/bigip.datasource';
import {getService} from '@loopback/service-proxy';
import {factory} from '../log4ts';
import {checkAndWait} from '../utils';
import path = require('path');
import {Logger} from 'typescript-logging';

export const BigipBuiltInProperties = {
  admin: 'admin',
  port: 443,
};

export interface BigipService {
  getInfo(url: string, cred64en: string): Promise<object>;

  installLicenseKey(
    url: string,
    cred64en: string,
    key: string,
  ): Promise<object>;

  installLicenseText(
    url: string,
    cred64en: string,
    text: string,
  ): Promise<object>;

  uploadFile(
    url: string,
    cred64en: string,
    end: number,
    length: number,
    body: object,
  ): Promise<object>;
  installObject(url: string, cred64en: string, body: object): Promise<object>;
}

export class BigipServiceProvider implements Provider<BigipService> {
  constructor(
    @inject('datasources.bigip')
    protected dataSource: BIGIPDataSource = new BIGIPDataSource(),
  ) {}

  value(): Promise<BigipService> {
    return getService(this.dataSource);
  }
}

export class BigIpManager {
  private bigipService: BigipService;
  private baseUrl: string;
  private cred64Encoded: string;
  private logger: Logger;

  constructor(private config: BigipConfig, private reqId: string) {
    this.logger = factory.getLogger(reqId + ': services.BigIpManager');
    this.baseUrl = `https://${this.config.ipAddr}:${this.config.port}`;
    this.cred64Encoded =
      'Basic ' +
      Buffer.from(`${this.config.username}:${this.config.password}`).toString(
        'base64',
      );
  }

  static async instanlize(
    config: BigipConfig,
    reqId = 'Unknown',
  ): Promise<BigIpManager> {
    let bigIpMgr = new BigIpManager(config, reqId);
    bigIpMgr.bigipService = await new BigipServiceProvider().value();
    return bigIpMgr;
  }

  async getSys(): Promise<object> {
    await this.mustBeReachable();

    let url = `${this.baseUrl}/mgmt/tm/sys`;
    let response = await this.bigipService.getInfo(url, this.cred64Encoded);
    return JSON.parse(JSON.stringify(response))['body'][0];
  }

  async getInterfaces(): Promise<BigipInterfaces> {
    await this.mustBeReachable();

    let url = `${this.baseUrl}/mgmt/tm/net/interface`;
    let response = await this.bigipService.getInfo(url, this.cred64Encoded);
    let resObj = JSON.parse(JSON.stringify(response))['body'][0];
    this.logger.debug(`get ${url} responses: ${JSON.stringify(resObj)}`);

    let items = resObj['items'];
    let interfaces: BigipInterfaces = {};
    for (let intf of items) {
      let macAddr = intf.macAddress;
      interfaces[macAddr] = {
        name: intf.name,
        macAddress: macAddr,
      };
    }

    return interfaces;
  }

  // The interface mac addresses are 'none' at the very beginning of the bigip readiness.
  // So we need to check and wait it becomes non-none.
  async getInterfacesNoNone(): Promise<BigipInterfaces> {
    let infs: BigipInterfaces;
    let checkFunc = async () => {
      infs = await this.getInterfaces();
      return Object.keys(infs).indexOf('none') < 0;
    };

    return await checkAndWait(checkFunc, 60).then(
      () => infs,
      () => {
        throw new Error('bigip mac addresses are not ready to get.');
      },
    );
  }

  async getLicense(): Promise<BigipLicense> {
    await this.mustBeReachable();

    let url = `${this.baseUrl}/mgmt/tm/sys/license`;

    let response = await this.bigipService.getInfo(url, this.cred64Encoded);
    let resObj = JSON.parse(JSON.stringify(response))['body'][0];
    this.logger.debug(`get ${url} responses: ${JSON.stringify(resObj)}`);

    if (resObj.entries) {
      for (let entry of Object.keys(resObj.entries)) {
        if (!entry.endsWith('/mgmt/tm/sys/license/0')) continue;

        return {
          registrationKey:
            resObj.entries[entry].nestedStats.entries.registrationKey
              .description,
        };
      }
    } else if (resObj.apiRawValues) {
      return {
        registrationKey: 'none',
      };
    }

    throw new Error(`License not found: from ${resObj}`);
  }

  async getConfigsyncIp(): Promise<string> {
    await this.mustBeReachable();

    let url = `${this.baseUrl}/mgmt/tm/cm/device`;
    let response = await this.bigipService.getInfo(url, this.cred64Encoded);
    let resObj = JSON.parse(JSON.stringify(response))['body'][0];
    this.logger.debug(`get ${url} responses: ${JSON.stringify(resObj)}`);

    let items = resObj['items'];
    for (let item of items) {
      if (item.managementIp === this.config.ipAddr) {
        return item.configsyncIp;
      }
    }
    throw new Error('No configsync IP');
  }

  async getDOStatus(): Promise<string> {
    await this.mustBeReachable();

    let url = `${this.baseUrl}/mgmt/shared/declarative-onboarding/info`;
    let response = await this.bigipService.getInfo(url, this.cred64Encoded);
    let resObj = JSON.stringify(response);
    return resObj;
  }

  async uploadDO(): Promise<object> {
    await this.mustBeReachable();
    const filename = process.env.DO_RPM_PACKAGE!;
    let fs = require('fs');
    if (!filename || filename === '' || !fs.existsSync(filename)) {
      throw new Error(`DO RPM file doesn't exist: '${filename}'`);
    }
    let fstats = fs.statSync(filename);

    let url = `${
      this.baseUrl
    }/mgmt/shared/file-transfer/uploads/${path.basename(filename)}`;
    let buffer = fs.readFileSync(filename, {endcoding: 'utf8'});
    let response = await this.bigipService.uploadFile(
      url,
      this.cred64Encoded,
      fstats.size - 1,
      fstats.size,
      buffer,
    );
    let resObj = JSON.parse(JSON.stringify(response)).body[0];
    return resObj;
  }

  async installDO(): Promise<string> {
    await this.mustBeReachable();
    let body = {
      operation: 'INSTALL',
      packageFilePath: `/var/config/rest/downloads/${path.basename(
        process.env.DO_RPM_PACKAGE!,
      )}`,
    };

    let url = `${this.baseUrl}/mgmt/shared/iapp/package-management-tasks`;
    let response = await this.bigipService.installObject(
      url,
      this.cred64Encoded,
      body,
    );
    let taskid = JSON.parse(JSON.stringify(response))['body'][0]['id'];
    let dourl = `${this.baseUrl}/mgmt/shared/iapp/package-management-tasks/${taskid}`;

    let status: string;
    let resChk: object;

    let checkFunc = async () => {
      let checkinfo = await this.bigipService.getInfo(
        dourl,
        this.cred64Encoded,
      );
      let resObj = JSON.parse(JSON.stringify(checkinfo))['body'][0];
      this.logger.debug(`get ${dourl} responses: ${JSON.stringify(resObj)}`);
      status = resObj['status'];
      resChk = resObj;

      if (status === 'FAILED') return Promise.reject(true);
      return status === 'FINISHED';
    };

    return await checkAndWait(checkFunc, 60).then(
      async () => status,
      () => {
        throw new Error(
          `Install DO failed: (status: ${status}, detail: ${JSON.stringify(
            resChk,
          )})`,
        );
      },
    );
  }

  async getAS3Info(): Promise<object> {
    await this.mustBeReachable();

    let url = `${this.baseUrl}/mgmt/shared/appsvcs/info`;
    let response = await this.bigipService.getInfo(url, this.cred64Encoded);
    return JSON.parse(JSON.stringify(response))['body'][0];
  }

  async getHostname(): Promise<string> {
    await this.mustBeReachable();

    let url = `${this.baseUrl}/mgmt/tm/sys/global-settings`;

    let response = await this.bigipService.getInfo(url, this.cred64Encoded);

    let resObj = JSON.parse(JSON.stringify(response));
    this.logger.debug(
      `get ${url} responses: ${JSON.stringify(resObj['body'][0])}`,
    );

    return resObj['body'][0]['hostname'];
  }

  async getVlans(): Promise<BigipVlans> {
    await this.mustBeReachable();

    let url = `${this.baseUrl}/mgmt/tm/net/vlan`;
    let response = await this.bigipService.getInfo(url, this.cred64Encoded);
    let resObj = JSON.parse(JSON.stringify(response))['body'][0];
    this.logger.debug(`get ${url} responses: ${JSON.stringify(resObj)}`);

    let vlans: BigipVlans = {};
    for (let vlan of resObj.items) {
      let name = vlan.name;
      vlans[name] = {
        tag: vlan.tag,
      };
    }
    return vlans;
  }

  async getSelfips(): Promise<BigipSelfips> {
    await this.mustBeReachable();

    let url = `${this.baseUrl}/mgmt/tm/net/self`;
    let response = await this.bigipService.getInfo(url, this.cred64Encoded);
    let resObj = JSON.parse(JSON.stringify(response))['body'][0];
    this.logger.debug(`get ${url} responses: ${JSON.stringify(resObj)}`);

    let selfips: BigipSelfips = {};
    for (let self of resObj.items) {
      let name = self.name;
      selfips[name] = {
        address: self.address,
      };
    }
    return selfips;
  }

  private async reachable(): Promise<boolean> {
    let isPortReachable = require('is-port-reachable');
    return isPortReachable(this.config.port, {
      host: this.config.ipAddr,
      timeout: 10000,
    });
  }

  private async mustBeReachable(): Promise<void> {
    return this.reachable()
      .then(b => {
        if (!b) throw new Error();
      })
      .catch(() => {
        let msg =
          'Host unreachable: ' +
          JSON.stringify({
            ipaddr: this.config.ipAddr,
            port: this.config.port,
          });
        throw new Error(msg);
      });
  }

  async installLicenseKey(key: string): Promise<object> {
    let url = `${this.baseUrl}/mgmt/tm/shared/licensing/activation`;
    return this.bigipService.installLicenseKey(url, this.cred64Encoded, key);
  }

  async installLicenseText(text: string): Promise<object> {
    let url = `${this.baseUrl}/mgmt/tm/shared/licensing/registration`;
    return await this.bigipService.installLicenseText(
      url,
      this.cred64Encoded,
      text,
    );
  }
}

type BigipConfig = {
  username: string;
  password: string;
  ipAddr: string;
  port: number;
  timeout?: number;
};

type BigipInterfaces = {
  [key: string]: {
    macAddress: string;
    name: string;
  };
};

type BigipLicense = {
  registrationKey: string;
};

type BigipVlans = {
  [key: string]: {
    tag: number;
  };
};

type BigipSelfips = {
  [key: string]: {
    address: string;
  };
};
