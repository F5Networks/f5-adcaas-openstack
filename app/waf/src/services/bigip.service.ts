import {Provider, inject} from '@loopback/core';
import {BIGIPDataSource} from '../datasources/bigip.datasource';
import {getService} from '@loopback/service-proxy';
import {factory} from '../log4ts';

export interface BigipService {
  getSysInfo(url: string, cred64en: string): Promise<object>;
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
  private logger = factory.getLogger('services.BigIpManager');

  constructor(private config: BigipConfig) {}

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

    let url = `https://${this.config.ipAddr}:${this.config.port}/mgmt/tm/sys`;
    let cred64Encoded =
      'Basic ' +
      Buffer.from(`${this.config.username}:${this.config.password}`).toString(
        'base64',
      );

    try {
      let response = await this.bigipService.getSysInfo(url, cred64Encoded);
      this.logger.debug(JSON.stringify(response));
      this.logger.debug(
        `Bigip becomes accessible before timeout time: ${leftMil}`,
      );
      return true;
    } catch (error) {
      this.logger.debug(`Bigip not accessible, trying after ${interval} secs`);
      await new Promise(resolve => {
        setTimeout(resolve, interval);
      });
      return await this.checkAndWaitBigipReady(leftMil - interval);
    }
  }
}

type BigipConfig = {
  username: string;
  password: string;
  ipAddr: string;
  port: number;
};
