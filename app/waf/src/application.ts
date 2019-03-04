import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import * as path from 'path';
import {MySequence} from './sequence';
import {LOG_BINDING} from './keys';
import {factory} from './log4ts';
import {AuthWithOSIdentity} from './services';
import {OpenStackComponent} from './components';

export class WafApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  private logger = factory.getLogger('application.setup');
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../../public'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    this.component(OpenStackComponent);

    this.bind(LOG_BINDING.LOGGER_GENERATOR).to(factory);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  async keepAliveAdminToken() {
    if (!process.env.PRODUCT_RELEASE) return;
    this.logger.debug('start to auth as admin');

    let totalTris = 10;
    let tried = 0;
    let durInMillSecs = 1000;

    let authWithOSIdentity = await this.get<AuthWithOSIdentity>(
      'services.openstack.AuthWithOSIdentity',
    );

    let delayFunc = async (ms: number) => {
      return new Promise(resolve => setTimeout(resolve, ms).unref());
    };

    while (true) {
      if (tried > totalTris) {
        throw new Error(
          `Tried ${tried} times connecting identity, but all fails.`,
        );
      }

      await delayFunc(durInMillSecs);

      try {
        await authWithOSIdentity.adminAuthToken().then(
          authObj => {
            this.logger.debug('admin authenticated.');
            this.logger.debug(JSON.stringify(authObj));
            tried = 0;

            durInMillSecs = Math.min(
              Math.pow(2, 31) - 1,
              Math.round(
                (authObj.expiredAt.getTime() - new Date().getTime()) / 2,
              ),
            );
          },
          reason => {
            this.logger.error('failed to get responnse: ' + reason);
            tried += 1;
            durInMillSecs = 1000;
          },
        );
      } catch (error) {
        this.logger.error('failed to authenticate: ' + error);
        tried += 1;
        durInMillSecs = 1000;
      }
    }
  }
}
