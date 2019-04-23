import {Provider, inject} from '@loopback/core';
import {BIGIPDataSource} from '../datasources/bigip.datasource';
import {getService} from '@loopback/service-proxy';
import {factory} from '../log4ts';

export interface BigipService {
  getInfo(url: string, cred64en: string): Promise<object>;
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
  private logger = factory.getLogger('services.BigIpManager');

  constructor(private config: BigipConfig) {
    this.baseUrl = `https://${this.config.ipAddr}:${this.config.port}`;
    this.cred64Encoded =
      'Basic ' +
      Buffer.from(`${this.config.username}:${this.config.password}`).toString(
        'base64',
      );
  }

  static async instanlize(config: BigipConfig): Promise<BigIpManager> {
    let bigIpMgr = new BigIpManager(config);
    bigIpMgr.bigipService = await new BigipServiceProvider().value();
    return bigIpMgr;
  }

  async checkAndWaitBigipReady(timeoutInMSecs: number): Promise<boolean> {
    if (timeoutInMSecs <= 0) {
      this.logger.debug('Timeout to access to bigip: ' + this.config.ipAddr);
      return false;
    }

    let interval = 500;
    let leftMil = timeoutInMSecs;

    let url = `${this.baseUrl}/mgmt/tm/sys`;

    try {
      let response = await this.bigipService.getInfo(url, this.cred64Encoded);
      this.logger.debug(JSON.stringify(response));
      this.logger.debug(
        `Bigip becomes accessible before timeout time: ${leftMil}`,
      );
      return true;
    } catch (error) {
      this.logger.debug(`Bigip not accessible, trying after ${interval} secs`);
      await new Promise(reslFunc => {
        setTimeout(reslFunc, interval);
      });
      return await this.checkAndWaitBigipReady(leftMil - interval);
    }
  }

  async checkAndWaitBigipOnboarded(
    timeoutInMSecs: number,
    hostname: string,
  ): Promise<boolean> {
    if (timeoutInMSecs <= 0) {
      this.logger.debug('Timeout to access to bigip: ' + this.config.ipAddr);
      return false;
    }

    let interval = 500;
    let leftMil = timeoutInMSecs;

    try {
      let response = await this.getHostname();
      this.logger.debug(JSON.stringify(response));
      if (response !== hostname) throw new Error('');
      this.logger.debug(`Bigip onboarded before timeout time: ${leftMil}`);
      return true;
    } catch (error) {
      this.logger.debug(
        `Bigip is still under onboarding, trying after ${interval} secs`,
      );
      await new Promise(reslFunc => {
        setTimeout(reslFunc, interval);
      });
      return await this.checkAndWaitBigipOnboarded(
        leftMil - interval,
        hostname,
      );
    }
  }

  async getInterfaces(): Promise<BigipInterfaces> {
    /**
     return {
       <macAddr>: {
         name: xxxx,
         macAddress: yyyy,
       }
     }
     */
    let url = `${this.baseUrl}/mgmt/tm/net/interface`;

    let response = await this.bigipService.getInfo(url, this.cred64Encoded);

    let resObj = JSON.parse(JSON.stringify(response));
    this.logger.debug(`get ${url} resposes: ${JSON.stringify(resObj[0])}`);

    let interfaces: BigipInterfaces = {};
    for (let intf of resObj['body'][0]['items']) {
      let macAddr = intf.macAddress;
      interfaces[macAddr] = {
        name: intf.name,
        macAddress: macAddr,
      };
    }

    return interfaces;
  }

  async getHostname(): Promise<string> {
    let url = `${this.baseUrl}/mgmt/tm/sys/global-settings`;

    let response = await this.bigipService.getInfo(url, this.cred64Encoded);

    let resObj = JSON.parse(JSON.stringify(response));
    this.logger.debug(
      `get ${url} resposes: ${JSON.stringify(resObj['body'][0])}`,
    );

    return resObj['body'][0]['hostname'];
  }
}

type BigipConfig = {
  username: string;
  password: string;
  ipAddr: string;
  port: number;
};

type BigipInterfaces = {
  [key: string]: {
    macAddress: string;
    name: string;
  };
};
