import {Member} from './member.model';
import {model, property, hasMany} from '@loopback/repository';
import {CommonEntity} from '.';

@model()
export class Pool extends CommonEntity {
  @property({
    type: 'string',
    required: false,
    default: 'round-robin',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'round-robin',
    },
  })
  loadBalancingMode: string;

  @hasMany(() => Member, {keyTo: 'poolId'})
  members?: Member[];

  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    default: [],
    schema: {
      create: true,
      update: true,
      response: true,
      example: [
        '23442d6a-4d82-40ee-8d08-243750dbc191',
        'aaaabbda-4d82-40ee-8d08-243750dbc192',
      ],
    },
  })
  monitors: string[];

  @property({
    type: 'number',
    required: false,
    default: 1,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 1,
    },
  })
  minimumMembersActive: number;

  @property({
    type: 'number',
    required: false,
    default: 1,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 1,
    },
  })
  minimumMonitors: number;

  @property({
    type: 'number',
    required: false,
    default: 0,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 0,
    },
  })
  reselectTries: number;

  @property({
    type: 'string',
    required: false,
    default: 'none',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'drop',
    },
  })
  serviceDownAction: string;

  @property({
    type: 'number',
    required: false,
    default: 10,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 10,
    },
  })
  slowRampTime: number;

  constructor(data?: Partial<Pool>) {
    super(data);
  }
}
