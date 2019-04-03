import { model, property } from '@loopback/repository';
import { CommonEntity } from '.';

export type PostBody = LaunchBody & DestroyBody & SetupBody & ConfigBody;

type LaunchBody = {
  launch: {};
};

type DestroyBody = {
  destroy: {};
};

type SetupBody = {
  setup: {};
};

type ConfigBody = {
  config: {
    veType: string
    platformType: PlatformType;
    networks: Networks;
    imageRef: string;
    flavorRef: string;
    management: {
      ip: FloatingIP;
      port: number;
      username: string;
      passphrase: string;
      sshKey?: string;
    };
  };
};

type FloatingIP = {
  floatingNetworkId: string;
  portId: string;
  floatingIpAddress?: string;
};

type NetworkInfo = {
  networkId?: string;
  portId?: string; // networkId OR portId is required.
  fixedIp?: string;
  vip?: string;
  floatingIp?: string;
}

type Networks = [NetworkInfo];

type VEStatus =
  | 'NONE'
  | 'POWERON'
  | 'POWEROFF'
  | 'BUILDING'
  | 'ACTIVE'
  | 'ERROR';

type PlatformType = 'OpenStack';

@model({ settings: { strict: false } })
export class WafInst extends CommonEntity {
  @property({
    type: 'string',
    required: true,
  })
  platformType: PlatformType;

  @property({
    type: 'array',
    required: true,
    itemType: 'object',
  })
  networks: Networks;

  @property({
    type: 'string',
    required: true,
  })
  imageRef: string;

  @property({
    type: 'string',
    required: true,
  })
  flavorRef: string;

  @property({
    type: 'string',
    required: true,
    default: 'NONE',
  })
  status: VEStatus;

  @property({
    type: 'object',
    required: true,
  })
  floatingip: FloatingIP;

  // Define well-known properties here

  // Indexer property to allow additional data
  //[prop: string]: any;

  constructor(data?: Partial<WafInst>) {
    super(data);
  }
}
