import {get} from '@loopback/rest';
import {MockBaseController} from './mock.base.controller';

export class MockSelfTestController extends MockBaseController {
  // TODO: regulate the url session from openstack.datasource.json

  constructor() {
    super();
  }

  @get('/test-openstack-simulation-ok')
  async openstackSimulationOK() {
    return {
      status: 'ok',
      datetime: new Date(),
    };
  }
}
