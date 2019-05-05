import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {TrustedDeviceDataSource} from '../datasources';

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

export interface TrustedDeviceService {
  // this is where you define the Node.js methods that will be
  // mapped to the SOAP operations as stated in the datasource
  // json file.
  trust(host: string, port: number, body: object): Promise<TrustedDevices>;
  query(host: string, port: number, deviceId: string): Promise<TrustedDevices>;
  untrust(
    host: string,
    port: number,
    deviceId: string,
  ): Promise<TrustedDevices>;
}

export class TrustedDeviceServiceProvider
  implements Provider<TrustedDeviceService> {
  constructor(
    // TrustedDevice must match the name property in the datasource json file
    @inject('datasources.TrustedDevice')
    protected dataSource: TrustedDeviceDataSource = new TrustedDeviceDataSource(),
  ) {}

  value(): Promise<TrustedDeviceService> {
    return getService(this.dataSource);
  }
}
