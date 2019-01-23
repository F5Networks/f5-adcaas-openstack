import {Entity, model, property} from '@loopback/repository';

@model()
export class GenericService extends Entity {
  @property({
    type: 'string',
    default: "Service_Generic",
  })
  class?: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  virtualAddresses?: string[];

  @property({
    type: 'number',
  })
  virtualPort?: number;

  @property({
    type: 'string',
  })
  pool?: string;

  @property({
    type: 'string',
    id: true,
    required: true,
  })
  id: string;

  constructor(data?: Partial<GenericService>) {
    super(data);
  }
}
