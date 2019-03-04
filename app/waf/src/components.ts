import {
  Component,
  CoreBindings,
  inject,
  Binding,
  BindingKey,
} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {AuthManager} from './services';

export class OpenStackComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: RestApplication,
  ) {}

  // TODO: make it work or find out the reason of not working.
  // providers = {
  //   'services.IdentityService': IdentityServiceProvider
  // };

  bindingAuth = Binding.bind(
    'services.openstack.AuthWithOSIdentity',
  ).toDynamicValue(async () => {
    let bindingKey = BindingKey.create(
      'services.openstack.InternalBindinng.AuthWithOSIdentitySingleton',
    );

    try {
      return await this.application.get(bindingKey);
    } catch (e) {
      try {
        let authWithOSIdentity = await new AuthManager().createAuthWorker();
        this.application.bind(bindingKey).to(authWithOSIdentity);
        return authWithOSIdentity;
      } catch (e) {
        return {};
      }
    }
  });

  bindings = [this.bindingAuth];
}
