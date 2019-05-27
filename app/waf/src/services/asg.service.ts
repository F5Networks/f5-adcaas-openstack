import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {ASGDataSource} from '../datasources';

const ASG_HOST: string = process.env.ASG_HOST || 'localhost';
const ASG_PORT: number = Number(process.env.ASG_PORT) || 8443;

type TrustedDeviceInfo = {
  targetHost: string;
  targetPort: number;
  targetUsername?: string;
  targetPassphrase?: string;
};

export type TrustedDeviceRequest = {
  devices: TrustedDeviceInfo[];
};

export type TrustedDevice = {
  targetUUID: string;
  targetHost: string;
  targetPort: number;
  state: string;
  targetHostname: string;
  targetVersion: string;
};

export type TrustedDevices = {
  devices: TrustedDevice[];
};

export interface ASGService {
  // this is where you define the Node.js methods that will be
  // mapped to the SOAP operations as stated in the datasource
  // json file.
  trust(host: string, port: number, body: object): Promise<TrustedDevices>;
  queryTrust(
    host: string,
    port: number,
    deviceId: string,
  ): Promise<TrustedDevices>;
  untrust(
    host: string,
    port: number,
    deviceId: string,
  ): Promise<TrustedDevices>;
}

export class ASGServiceProvider implements Provider<ASGService> {
  constructor(
    // ASG must match the name property in the datasource json file
    @inject('datasources.asg')
    protected dataSource: ASGDataSource = new ASGDataSource(),
  ) {}

  value(): Promise<ASGService> {
    return getService(this.dataSource);
  }
}

export class ASGManager {
  private service: ASGService;

  constructor(svc: ASGService) {
    this.service = svc;
  }

  async trust(
    mgmtIp: string,
    mgmtPort: number,
    username: string,
    password: string,
  ): Promise<TrustedDevice> {
    let body: TrustedDeviceRequest = {
      devices: [
        {
          targetHost: mgmtIp,
          targetPort: mgmtPort,
          targetUsername: username,
          targetPassphrase: password,
        },
      ],
    };

    let devices = (await this.service.trust(ASG_HOST, ASG_PORT, body)).devices;

    if (devices.length === 1) {
      return devices[0];
    } else {
      throw new Error('Trusted device response size is ' + devices.length);
    }
  }

  async getTrustState(id: string): Promise<string> {
    let devices = (await this.service.queryTrust(ASG_HOST, ASG_PORT, id))
      .devices;

    if (devices.length === 1) {
      return devices[0].state;
    } else {
      throw new Error('Trusted device response size is ' + devices.length);
    }
  }

  async untrust(id: string): Promise<void> {
    let devices = (await this.service.untrust(ASG_HOST, ASG_PORT, id)).devices;

    if (devices.length === 1 && devices[0].state === 'DELETING') {
      return;
    } else {
      throw new Error('Fail to delete trusted device');
    }
  }
}
