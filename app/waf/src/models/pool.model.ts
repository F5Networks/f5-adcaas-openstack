import {Member} from './member.model';
import {Entity, model, property, hasMany} from '@loopback/repository';

@model()
export class Pool extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: false,
  })
  name?: string;

  @property({
    type: 'string',
    required: false,
    default: 'round-robin',
  })
  loadBalancingMode: string;

  @hasMany(() => Member, {keyTo: 'poolId'})
  members?: Member[];

  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    default: [],
  })
  monitors: string[];

  constructor(data?: Partial<Pool>) {
    super(data);
  }
}
