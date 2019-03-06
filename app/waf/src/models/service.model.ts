import {Entity, model, property} from '@loopback/repository';

@model()
export class Service extends Entity {
  @property({
    type: 'string',
    id: true,
    required: false,
  })
  id: string;

  @property({
    type: 'string',
    required: false,
  })
  name?: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  virtualAddresses: string[];

  @property({
    type: 'number',
    required: false,
  })
  virtualPort?: number;

  @property({
    type: 'string',
    required: false,
  })
  pool?: string;

  @property({
    type: 'string',
    required: false,
  })
  endpointpolicy: string;

  @property({
    type: 'string',
    required: true,
  })
  applicationId: string;

  constructor(data?: Partial<Service>) {
    super(data);
  }
}
