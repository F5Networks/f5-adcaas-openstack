import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './bigip.datasource.json';

export class BIGIPDataSource extends juggler.DataSource {
  static dataSourceName = 'bigip';

  constructor(
    @inject('datasources.config.bigip', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
