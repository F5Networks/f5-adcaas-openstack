import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './do.datasource.json';

export class DoDataSource extends juggler.DataSource {
  static dataSourceName = 'do';

  constructor(
    @inject('datasources.config.do', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
