import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './trusteddevice.datasource.json';

export class TrustedDeviceDataSource extends juggler.DataSource {
  static dataSourceName = 'TrustedDevice';

  constructor(
    @inject('datasources.config.TrustedDevice', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
