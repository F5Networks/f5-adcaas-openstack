import {Component, CoreBindings, inject, Binding} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {
  AuthManager,
  ComputeManagerV2,
  IdentityServiceProvider,
  AuthWithOSIdentity,
} from './services';
import {NetworkDriver} from './services/network.service';
import {factory} from './log4ts';
import {WafBindingKeys} from './keys';

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

  bindingAuth = Binding.bind(
    WafBindingKeys.KeyAuthWithOSIdentity,
  ).toDynamicValue(async () => {
    try {
      const identityService = await new IdentityServiceProvider().value();
      return new AuthManager(
        this.application,
        identityService,
      ).createAuthWorker();
    } catch (error) {
      return <AuthWithOSIdentity>{};
    }
  });

  bindingNetwork = Binding.bind(WafBindingKeys.KeyNetworkDriver).toDynamicValue(
    async () => {
      // NOTE: this is not singleton instance.
      return await new NetworkDriver(this.application).bindNetworkService();
    },
  );

  bindingCompute = Binding.bind(
    WafBindingKeys.KeyComputeManager,
  ).toDynamicValue(async () => {
    return await new ComputeManagerV2(this.application).bindComputeService();
  });

  bindings = [this.bindingAuth, this.bindingNetwork, this.bindingCompute];
}
