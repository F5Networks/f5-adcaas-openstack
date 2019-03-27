class IdentityHelper {
  authUser(): Promise<object> {
    return Promise.resolve({});
  }
  authAdmin(): Promise<object> {
    return Promise.resolve({});
  }
}

class NetworkHelper {
  collectNetworksInfo(): object {
    return {};
  }
  collectSubnetsInfo(): object {
    return {};
  }
  collectPortsInfo(): object {
    return {};
  }
  createPort(): object {
    return {};
  }
  bindFixedIp(): object {
    return {};
  }
  // else
}

class ComputeHelper {
  createInstance(): object {
    return {};
  }
  getInstanceDetail(): object {
    return {};
  }
  collectImagesInfo(): object {
    return {};
  }
  collectFlavorsInfo(): object {
    return {};
  }
}

class DOHelper {
  onboardingBigIp(): Promise<object> {
    return Promise.resolve({});
  }
  private revokeLicense() {}
  private configHA() {}
  private configDNS() {}
  // .. more
}

class ASGHelper {
  configTrustedDevices(): Promise<object> {
    return Promise.resolve({});
  }
  retrieveTrustedDevices() {}
  pushTrustedExtensions(): Promise<object> {
    return Promise.resolve({});
  }
  retrieveTrustedExtensions() {}
  pushTrustedASMPolicies(): Promise<object> {
    return Promise.resolve({});
  }
  retrieveTrustedASMPolicies() {}
  deployAS3(): Promise<object> {
    return Promise.resolve({});
  }
  // .. more
}

abstract class PlatformHelper {
  abstract collectPlatformMeta(
    tenantId: string,
    userToken: string,
  ): Promise<PlatformMeta>;
  abstract createBigIpInstance(): Promise<object>;
}
class OpenStackHelper extends PlatformHelper {
  private identityHelper: IdentityHelper;
  private networkHelper: NetworkHelper;
  private computeHelper: ComputeHelper;

  constructor(userConfig: object) {
    super();
    // convert config to token infor.
  }

  async collectPlatformMeta(
    tenantId: string,
    userToken: string,
  ): Promise<PlatformMeta> {
    let pm: PlatformMeta = initializePlatformMeta();

    try {
      await this.identityHelper.authUser().then(authedToken => {
        Promise.all([
          this.networkHelper.collectNetworksInfo(),
          this.networkHelper.collectSubnetsInfo(),
          this.networkHelper.collectPortsInfo(),
          this.computeHelper.collectFlavorsInfo(),
          this.computeHelper.collectImagesInfo(),
        ]).then(results => {
          // assemble PlatformMeta here.
          let assmed = results;
          Object.assign(pm, assmed);
        });
      });
      return Promise.resolve(pm);
    } catch (error) {}
    throw new Error('...');
  }

  createBigIpInstance(): Promise<object> {
    return Promise.resolve({});
  }
}

export class WafManager {
  private platformHelper: PlatformHelper;
  private doHelper: DOHelper;
  private asgHelper: ASGHelper;

  private wafConfig: {
    tenantId: string;
    userToken: string;
  };

  constructor() {}

  // CRUD
  deployWafInstance(
    extraConfig: object = {
      /* for only one specific network? */
    },
  ): Promise<object> {
    this.platformHelper
      .collectPlatformMeta(this.wafConfig.tenantId, this.wafConfig.userToken)
      .then(pm => {
        this.platformHelper.createBigIpInstance().then(inst => {
          this.doHelper.onboardingBigIp().then(rlt => {
            this.asgHelper.configTrustedDevices().then(trusted => {
              this.asgHelper.pushTrustedExtensions().then(done => {
                this.asgHelper.pushTrustedASMPolicies().then(policies => {
                  this.asgHelper.deployAS3().then(as3 => {
                    // declare all done ...
                  });
                });
              });
            });
          });
        });
      });

    return Promise.resolve({});
  }

  deleteWafInstance() {}
  queryWafInstance() {}
  updateWafInstance() {}
}

function initializePlatformMeta(): PlatformMeta {
  return {
    tenantId: 'v',
    networks: [{}],
    subnets: [{}],
    flavors: [{}],
    images: [{}],
  };
}

type PlatformMeta = {
  tenantId: string;
  networks: object[];
  subnets: object[];
  flavors: object[];
  images: object[];
};
