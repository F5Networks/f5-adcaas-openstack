import {Adc} from '../models';
import {BigIpManager} from './bigip.service';
import {ASGManager, ASGServiceProvider} from './asg.service';

export type AddonReqValues = {
  userToken: string;
  tenantId: string;
};

export class AdcStateCtrlr {
  private states: AdcStateEntry[] = [
    {
      state: AdcState.NEW,
      check: (ctrl: AdcStateCtrlr) => {
        return Promise.resolve(true);
      },
      next: [AdcState.POWERON],
    },
    {
      failure: AdcState.POWERERR,
      state: AdcState.POWERON,
      check: this.accessible,
      next: [AdcState.ONBOARDED, AdcState.RECLAIMED],
    },
    {
      failure: AdcState.ONBOARDERR,
      state: AdcState.ONBOARDED,
      check: this.onboarded,
      next: [AdcState.TRUSTED, AdcState.RECLAIMED],
    },
    {
      failure: AdcState.TRUSTERR,
      state: AdcState.TRUSTED,
      check: this.trusted,
      next: [AdcState.INSTALLED, AdcState.RECLAIMED],
    },
    {
      failure: AdcState.INSTALLERR,
      state: AdcState.INSTALLED,
      check: this.installed,
      next: [AdcState.RECLAIMED, AdcState.ACTIVE],
    },
    {
      failure: AdcState.RECLAIMERR,
      state: AdcState.RECLAIMED,
      check: this.reclaimed,
      next: [AdcState.POWERON],
    },
    {
      state: AdcState.ACTIVE,
      check: (ctrl: AdcStateCtrlr) => {
        return Promise.resolve(true);
      },
      next: [AdcState.RECLAIMED],
    },
  ];

  constructor(private adc: Adc, private addon: AddonReqValues) {}

  async readyTo(state: string): Promise<boolean> {
    let stateEntry = this.getStateEntry(this.adc.status);
    if (state === stateEntry.state) return true; // recoverable.
    return (await stateEntry['check'](this)) && stateEntry.next.includes(state);
  }

  async gotTo(state: string): Promise<boolean> {
    return this.getStateEntry(state)['check'](this);
  }

  private getStateEntry(name: string): AdcStateEntry {
    return this.states.find(s => {
      return s.state === name || s.failure === name;
    })!;
  }

  private async getBigipMgr(): Promise<BigIpManager> {
    if (!this.adc.management)
      throw new Error(
        `The management session of ADC is empty, cannot initialize bigip manager.`,
      );

    let mgmt = this.adc.management;
    return BigIpManager.instanlize({
      username: mgmt.username,
      password: mgmt.password,
      ipAddr: mgmt.ipAddress,
      port: mgmt.tcpPort,
    });
  }

  private async getAsgMgr(): Promise<ASGManager> {
    let svc = await new ASGServiceProvider().value();
    return new ASGManager(svc);
  }

  // Notices:
  // Why not use 'this' in the following functions:
  // The scope of 'this' changes when placing 'this.onboarded/trusted/...'
  // in the AdcStateEntry declaration in the above 'states' member.
  // So, please pass in the 'ctrl' object to when accessing AdcStateCtrlr.

  private reclaimed(ctrl: AdcStateCtrlr): Promise<boolean> {
    return Promise.resolve(
      ((): boolean => {
        if (ctrl.adc.management) return false;
        if (ctrl.adc.compute.vmId) return false;
        for (let net of Object.keys(ctrl.adc.networks)) {
          if (ctrl.adc.networks[net].portId) return false;
        }
        return true;
      })(),
    );
  }

  private async trusted(ctrl: AdcStateCtrlr): Promise<boolean> {
    if (!ctrl.adc.trustedDeviceId!) return false;

    let asgMgr = await ctrl.getAsgMgr();
    let state = await asgMgr.getTrustState(ctrl.adc.trustedDeviceId!);
    return state === 'ACTIVE';
  }

  private async onboarded(ctrl: AdcStateCtrlr): Promise<boolean> {
    let bigipMgr = await ctrl.getBigipMgr();
    return Promise.all([
      bigipMgr.getHostname(),
      bigipMgr.getLicense(),
      bigipMgr.getConfigsyncIp(),
      bigipMgr.getVlans(),
      bigipMgr.getSelfips(),
    ]).then(([hostname, license, configSyncIp, vlans, selfs]) => {
      return (
        hostname.includes(ctrl.adc.id) &&
        license.registrationKey !== 'none' &&
        configSyncIp !== 'none' &&
        Object.keys(vlans).length !== 0 &&
        Object.keys(selfs).length !== 0
      );
    });
  }

  private async accessible(ctrl: AdcStateCtrlr): Promise<boolean> {
    let bigipMgr = await ctrl.getBigipMgr();

    return bigipMgr
      .getSys()
      .then(() => Promise.resolve(true))
      .catch(() => Promise.reject(false));
  }

  private async installed(ctrl: AdcStateCtrlr): Promise<boolean> {
    let asgMgr = await ctrl.getAsgMgr();

    return (
      (await asgMgr.as3Exists(ctrl.adc.trustedDeviceId!)) &&
      (await asgMgr.getAS3State(ctrl.adc.trustedDeviceId!)) === 'AVAILABLE'
    );
  }
}

type AdcStateEntry = {
  failure?: string;
  state: string;
  check: (ctr: AdcStateCtrlr) => Promise<boolean>;
  next: string[];
};

export enum AdcState {
  NEW = 'NEW',

  POWERON = 'POWERON',
  POWERING = 'POWERING',
  POWERERR = 'POWERERROR',

  ONBOARDED = 'ONBOARDED',
  ONBOARDING = 'ONBOARDING',
  ONBOARDERR = 'ONBOARDERROR',

  TRUSTED = 'TRUSTED',
  TRUSTING = 'TRUSTING',
  TRUSTERR = 'TRUSTERROR',

  INSTALLED = 'INSTALLED',
  INSTALLING = 'INSTALLING',
  INSTALLERR = 'INSTALLERROR',

  RECLAIMED = 'RECLAIMED',
  RECLAIMING = 'RECLAIMING',
  RECLAIMERR = 'RECLAIMERROR',

  ACTIVE = 'ACTIVE',
}
