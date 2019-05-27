import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './asg.datasource.json';

export class ASGDataSource extends juggler.DataSource {
  static dataSourceName = 'asg';

  constructor(
    @inject('datasources.config.asg', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
