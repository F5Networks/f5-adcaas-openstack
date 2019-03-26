import {MockBaseController} from '../../helpers/rest.helpers';
import {get} from '@loopback/rest';

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
