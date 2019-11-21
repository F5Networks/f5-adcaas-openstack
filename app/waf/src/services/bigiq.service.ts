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

import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {BigIqDataSource} from '../datasources';
import {factory} from '../log4ts';
import {Logger} from 'typescript-logging';
import {checkAndWait} from '../utils';

const BIGIQ_HOST: string = process.env.BIGIQ_HOST || 'localhost';
const BIGIQ_PORT: number = Number(process.env.BIGIQ_PORT) || 8888;
const BIGIQ_USERNAME: string = process.env.BIGIQ_USERNAME || 'admin';
const BIGIQ_PASSWORD: string = process.env.BIGIQ_PASSWORD || 'admin';
const BIGIQ_POOL: string = process.env.BIGIQ_POOL || 'unknown';

type BigIqToken = {
  token: string;
  exp: number;
};

type LoginResponse = {
  token: BigIqToken;
};

type AssignResponse = {
  id: string;
};

type RevokeResponse = {
  id: string;
};

type QueryResponse = {
  status: string;
  errorMessage: string;
  licenseAssignmentReference: {
    link: string;
  };
  licenseText: string;
};

type UnreachableLicense = {
  key: string;
  text: string;
};

export interface BigIqService {
  login(
    host: string,
    port: number,
    username: string,
    password: string,
  ): Promise<LoginResponse>;

  assign(
    host: string,
    port: number,
    token: string,
    body: object,
  ): Promise<AssignResponse>;

  revoke(
    host: string,
    port: number,
    token: string,
    body: object,
  ): Promise<RevokeResponse>;

  query(
    host: string,
    port: number,
    token: string,
    task: string,
  ): Promise<QueryResponse>;
}

export class BigIqServiceProvider implements Provider<BigIqService> {
  constructor(
    @inject('datasources.bigiq')
    protected dataSource: BigIqDataSource = new BigIqDataSource(),
  ) {}

  value(): Promise<BigIqService> {
    return getService(this.dataSource);
  }
}

export class BigIqManager {
  private service: BigIqService;
  private logger: Logger;
  private static token: BigIqToken;

  constructor(svc: BigIqService, reqId = 'Unknown') {
    this.service = svc;
    this.logger = factory.getLogger(reqId + ': services.BigIqManager');
  }

  async login(): Promise<BigIqToken> {
    let current = new Date().getTime() / 1000;
    // Login BIG-IQ, if no token or token will expire in 30 seconds
    if (!BigIqManager.token || current > BigIqManager.token.exp - 30) {
      let resp = await this.service.login(
        BIGIQ_HOST,
        BIGIQ_PORT,
        BIGIQ_USERNAME,
        BIGIQ_PASSWORD,
      );
      BigIqManager.token = resp.token;
      this.logger.debug(`BIG-IQ token will expire at ${resp.token.exp}`);
    }

    return BigIqManager.token;
  }

  async assignLicense(
    address: string,
    mac: string,
    pool: string = BIGIQ_POOL,
  ): Promise<UnreachableLicense> {
    let body = {
      licensePoolName: pool,
      command: 'assign',
      address: address,
      assignmentType: 'UNREACHABLE',
      macAddress: mac.toUpperCase(),
      hypervisor: 'kvm',
    };

    return this.assign(body);
  }

  async assign(body: object): Promise<UnreachableLicense> {
    let token = await this.login();
    let assignResp = await this.service.assign(
      BIGIQ_HOST,
      BIGIQ_PORT,
      token.token,
      body,
    );

    let taskId = assignResp.id;
    let taskFinished = async (): Promise<boolean> => {
      return await this.service
        .query(BIGIQ_HOST, BIGIQ_PORT, token.token, taskId)
        .then(
          resp => {
            this.logger.debug(
              `Assigning license task status is ${resp.status}`,
            );
            switch (resp.status) {
              case 'FINISHED':
                return true;
              case 'FAILED':
                Promise.reject(resp.errorMessage);
              default:
                return false;
            }
          },
          err => Promise.reject(err),
        );
    };

    await checkAndWait(taskFinished, 30);

    let lic = await this.service.query(
      BIGIQ_HOST,
      BIGIQ_PORT,
      token.token,
      taskId,
    );
    // Parse license key from reference link
    let licLink = lic.licenseAssignmentReference.link;
    let begin = licLink.indexOf('offerings') + 10;
    let licKey = licLink.substr(begin, 31);

    return {
      key: licKey,
      text: lic.licenseText,
    };
  }

  async revokeLicense(
    address: string,
    mac: string = '',
    pool: string = BIGIQ_POOL,
  ): Promise<void> {
    let body = {
      licensePoolName: pool,
      command: 'revoke',
      address: address,
    };

    if (mac) {
      // Unreachable license
      Object.assign(body, {
        assignmentType: 'UNREACHABLE',
        macAddress: mac.toUpperCase(),
      });
    } else {
      // Unmanaged license
      Object.assign(body, {
        user: 'wrong',
        password: 'wrong',
      });
    }

    return this.revoke(body);
  }

  async revoke(body: object): Promise<void> {
    let token = await this.login();
    let revokeResp = await this.service.revoke(
      BIGIQ_HOST,
      BIGIQ_PORT,
      token.token,
      body,
    );

    let taskId = revokeResp.id;
    let taskFinished = async (): Promise<boolean> => {
      return this.service
        .query(BIGIQ_HOST, BIGIQ_PORT, token.token, taskId)
        .then(
          resp => {
            this.logger.debug(`Revoking license task status is ${resp.status}`);
            switch (resp.status) {
              case 'FINISHED':
                return true;
              case 'FAILED':
                Promise.reject(resp.errorMessage);
              default:
                return false;
            }
          },
          err => Promise.reject(err),
        );
    };

    await checkAndWait(taskFinished, 30);
  }
}
