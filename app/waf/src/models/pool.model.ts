import {Entity, model, property} from '@loopback/repository';

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

  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    default: [],
  })
  members: string[];

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
