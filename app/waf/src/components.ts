import {
  Component,
  CoreBindings,
  inject,
  Binding,
  BindingKey,
} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {
  AuthManager,
  ComputeManagerV2,
  IdentityServiceProvider,
} from './services';
import {NetworkDriver} from './services/network.service';
import {factory} from './log4ts';

export const bindingKeyAuthWithOSIdentity = BindingKey.create(
  'services.openstack.AuthWithOSIdentity',
);

export const bindingKeyAdminAuthedToken = BindingKey.create(
  'services.openstack.AdminAuthedToken',
);

export const bindingKeyComputeManager = BindingKey.create(
  'services.openstack.ComputeManager',
);

export const bindingKeyNetworkDriver = BindingKey.create(
  'services.openstack.NetworkDriver',
);

export class OpenStackComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: RestApplication,
    // @inject('services.IdentityService')
    // private identityService: IdentityService,
    private logger = factory.getLogger('components.openstack'),
  ) {}

  // TODO: make it work or find out the reason of not working.
  // providers = {
  //   'services.IdentityService': IdentityServiceProvider
  // };

  bindingAuth = Binding.bind(bindingKeyAuthWithOSIdentity).toDynamicValue(
    async () => {
      try {
        const identityService = await new IdentityServiceProvider().value();
        return new AuthManager(
          this.application,
          identityService,
        ).createAuthWorker();
      } catch (error) {
        return {}; // TODO: consider the better return in exception.
      }
    },
  );

  bindingNetwork = Binding.bind(bindingKeyNetworkDriver).toDynamicValue(
    async () => {
      // NOTE: this is not singleton instance.
      return await new NetworkDriver(this.application).bindNetworkService();
    },
  );

  bindingCompute = Binding.bind(bindingKeyComputeManager).toDynamicValue(
    async () => {
      return await new ComputeManagerV2(this.application).bindComputeService();
    },
  );

  bindings = [this.bindingAuth, this.bindingNetwork, this.bindingCompute];
}
