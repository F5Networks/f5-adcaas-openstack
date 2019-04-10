import {model, property} from '@loopback/repository';
import {CommonEntity} from '.';

export type ActionsBody = CreateBody & DeleteBody & SetupBody;

type CreateBody = {
  create: {
    id: string;
  };
};

type DeleteBody = {
  delete: {
    id: string;
  };
};

type SetupBody = {
  setup: {
    id: string;
  };
};

export type ConfigTypes = {
  type: string;
  //platformType: 'OpenStack';
  networks: {
    name?: string;
    type: 'mgmt' | 'ext' | 'int' | 'ha';
    networkId: string;
    fixedIp?: string;
    //floatingIp?: string;
    portId?: string; // cannot be appointed.
    ready?: boolean; // cannot be appointed.
    //vips?: [string]; // cannot be appointed.
  }[];
  compute: {
    imageRef: string;
    flavorRef: string;
    userData?: string;
    vmId?: string; // cannot be appointed.
  };
  //floatingNetworkId?: string;
  securityGroup?: [string];
  management: {
    // cannot be appointed.
    ipAddress: string; // mostly floatingIp.
    tcpPort: number;
    // no username passphrase, use admin/admin for 1st phase.
  };
  status: 'NONE' | 'POWERON' | 'POWEROFF' | 'BUILDING' | 'ACTIVE' | 'ERROR'; // cannot be appointed.
};

// TODO: To be extended.
// onBoarding: {
//   declaration: {
//     dsc: {
//       trusts: [];
//       sync: {};
//       failover: {};
//       group: {};
//     };
//     system: {
//       licenses: {};
//       provisions: {};
//       dns: {};
//       ntp: {};
//       users: {};
//       // ...
//     };
//     network: {
//       selfips: [];
//       vlans: [];
//       routes: [];
//     };
//   };
// };

@model()
export class Adc extends CommonEntity {
  @property({
    type: 'string',
    required: true,
    default: 'VE',
    schema: {
      create: true,
      response: true,
      required: true,
      example: 'VE',
    },
  })
  type: string;

  @property({
    type: 'array',
    required: true,
    itemType: 'object',
    schema: {
      response: true,
    },
  })
  networks: ConfigTypes['networks'];

  @property({
    type: 'object',
    required: true,
    schema: {
      response: true,
    },
  })
  compute: ConfigTypes['compute'];

  // @property({
  //   type: 'string',
  //   required: true,
  // })
  // floatingNetworkId: string;

  // @property({
  //   type: 'array',
  //   itemType: 'string',
  //   schema: {
  //     response: true,
  //   },
  // })
  // securityGroup?: [string];

  @property({
    type: 'object',
    required: true,
    schema: {
      response: true,
    },
  })
  management: ConfigTypes['management'];

  @property({
    type: 'string',
    required: true,
    default: 'NONE',
    schema: {
      response: true,
    },
  })
  status: ConfigTypes['status'];

  // @property({
  //   type: 'object',
  //   required: true,
  // })
  // onBoarding: ConfigBody['onBoarding'];

  constructor(data?: Partial<Adc>) {
    super(data);
  }
}
