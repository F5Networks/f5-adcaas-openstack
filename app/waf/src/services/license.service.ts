import {Adc} from '../models';
import {Logger} from 'typescript-logging';
import {inject} from '@loopback/core';
import {DOService, TypeDOClassDO} from './do.service';
import {BigIqService, BigIqManager} from './bigiq.service';
import {factory} from '../log4ts';

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

export type LicConfig = {
  BIGIQSetting?: {
    hostname: string;
    username: string;
    password: string;
    poolname: string;
    timeout?: number;
  };
  licenseKey?: string;
  BIGIPSetting: Adc;
};

export class LicenseManager {
  private reachable: boolean;
  private logger: Logger;
  private biqMgr: BigIqManager;

  constructor(
    private settings: LicConfig,
    requestId: string,
    private doEndpoint: string,
    private doBasicAuth: string,
    @inject('services.DOService')
    private doService: DOService,
    @inject('services.BigIqService')
    private biqService: BigIqService,
  ) {
    this.logger = factory.getLogger(`[${requestId}]: license.manager`);

    if (settings.licenseKey) this.reachable = false;
    else if (settings.BIGIQSetting) this.reachable = false;
    else
      throw new Error('Either licenseKey or BIGIQSetting should be non-empty.');

    this.biqMgr = new BigIqManager(this.biqService, requestId);
  }

  private getDoBody(revoke = false, async = true): TypeDOClassDO {
    let keyName = revoke ? 'revokeFrom' : 'licensePool';
    let biqSettings = this.settings.BIGIQSetting!;
    let bipSettings = this.settings.BIGIPSetting;

    biqSettings.timeout = biqSettings.timeout ? biqSettings.timeout : 900;
    for (let k of Object.keys(biqSettings)) {
      if (!(<{[k: string]: string | number}>biqSettings)[k])
        throw new Error(`settings.${k} cannot be empty!`);
    }

    return {
      class: 'DO',
      declaration: {
        schemaVersion: '1.5.0',
        class: 'Device',
        async: async,
        label: 'license onboarding',
        Common: {
          class: 'Tenant',
          hostname: bipSettings.id + '.f5bigip.local',
          myLicense: {
            class: 'License',
            licenseType: 'licensePool',
            bigIqHost: biqSettings.hostname,
            bigIqUsername: biqSettings.username,
            bigIqPassword: biqSettings.password,
            [keyName]: biqSettings.poolname,
            reachable: this.reachable,
            hypervisor: 'kvm',
          },
        },
      },
    };
  }

  private async postDoBody(body: object): Promise<string> {
    let headers = {Authorization: 'Basic ' + this.doBasicAuth};

    this.logger.debug(`postDoBody: ${JSON.stringify(body)}`);
    return this.doService
      .doRest(
        'POST',
        this.doEndpoint + '/mgmt/shared/declarative-onboarding',
        headers,
        body,
      )
      .then(
        response => {
          let resObj = JSON.parse(JSON.stringify(response));
          return resObj[0]['id'];
        },
        reason => {
          // if onboarding fails.
          let mesg = 'Failed to onboarding device: ' + JSON.stringify(reason);
          this.logger.error(mesg);
          throw new Error(mesg);
        },
      );
  }

  // BIG-IQ ✓<-->✓ BIG-IP
  private async licViaDo(): Promise<string> {
    let body = this.getDoBody(false, true);
    return this.postDoBody(body);
  }
  private async unLicViaDO(): Promise<string> {
    let body = this.getDoBody(true, true);
    return this.postDoBody(body);
  }

  // BIG-IQ x<-->x BIG-IP
  private async licViaKey(): Promise<string> {
    return Promise.resolve('response_request_id');
  }
  private async unLicViaKey() {}

  // // BIG-IQ ✓<-->x BIG-IP
  // private async licViaBIQ() { }
  private async unLicViaBIQ(adc: Adc): Promise<void> {
    let address = adc.management.connection!.ipAddress;
    let mac = '';
    for (let net of Object.keys(adc.networks)) {
      if (adc.networks[net].type === 'mgmt') {
        mac = adc.management.networks[net].macAddr!;
      }
    }
    return this.biqMgr.revokeLicense(address, mac);
  }

  async license(): Promise<string> {
    if (this.settings.licenseKey) return this.licViaKey();
    if (this.settings.BIGIQSetting) return this.licViaDo();

    return Promise.reject(
      'Either licenseKey or BIGIQSetting should be non-empty.',
    );
  }

  async unLicense(adc: Adc): Promise<void> {
    if (this.settings.licenseKey) return;
    if (this.settings.BIGIQSetting) return this.unLicViaBIQ(adc);

    return Promise.reject(
      'Either licenseKey or BIGIQSetting should be non-empty.',
    );
  }
}
