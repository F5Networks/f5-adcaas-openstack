import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './openstack.datasource.json';

export class OpenstackDataSource extends juggler.DataSource {
  static dataSourceName = 'openstack';

  constructor(
    @inject('datasources.config.openstack', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
