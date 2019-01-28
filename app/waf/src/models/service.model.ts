import {Entity, model, property} from '@loopback/repository';

@model()
export class Service extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  class: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  virtualAddresses: string[];

  @property({
    type: 'number',
  })
  virtualPort?: number;

  @property({
    type: 'string',
  })
  pool?: string;

  constructor(data?: Partial<Service>) {
    super(data);
  }
}
