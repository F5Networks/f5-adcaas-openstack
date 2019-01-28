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
    default: 'Pool',
  })
  class?: string;

  @property({
    type: 'string',
    default: 'round-robin',
  })
  loadBalancingMode?: string;

  @property({
    type: 'array',
    itemType: 'object',
  })
  members?: object[];

  @property({
    type: 'array',
    itemType: 'string',
  })
  monitors?: string[];

  constructor(data?: Partial<Pool>) {
    super(data);
  }
}
