import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './as3.datasource.json';

export class AS3DataSource extends juggler.DataSource {
  static dataSourceName = 'AS3';

  constructor(
    @inject('datasources.config.AS3', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
