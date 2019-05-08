import {Component, CoreBindings, inject, Binding} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {
  AuthManager,
  ComputeManagerV2,
  IdentityServiceProvider,
  AuthWithOSIdentity,
} from './services';
import {NetworkDriver} from './services/network.service';
import {WafBindingKeys} from './keys';

export class OpenStackComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: RestApplication,
  ) {}

  // TODO: make it work or find out the reason of not working.
  // providers = {
  //   'services.IdentityService': IdentityServiceProvider
  // };

  bindingSolveAdminToken = Binding.bind(
    WafBindingKeys.KeySolvedAdminToken,
  ).toDynamicValue(async () => {
    return await this.application
      .get(WafBindingKeys.KeyAuthWithOSIdentity)
      .then(authHelper => {
        return authHelper.solveAdminToken();
      });
  });

  bindingAuthMgr = Binding.bind(
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
  }); //.inScope(BindingScope.SINGLETON);
  // Note: Make it a singleton may be not a good way.
  // The singleton instance stay constant even when some condition happens.
  // i.e. from the above '<AuthWithOSIdentity>{}' exception case back to normal.

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

  bindings = [
    this.bindingSolveAdminToken,
    this.bindingAuthMgr,
    this.bindingNetwork,
    this.bindingCompute,
  ];
}
