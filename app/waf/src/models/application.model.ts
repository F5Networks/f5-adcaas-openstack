import {Entity, model, property} from '@loopback/repository';

@model()
export class Application extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: false,
  })
  description?: string;

  @property({
    type: 'string',
    required: true,
  })
  tenantId: string;
  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    default: [],
  })
  services: string[];
  @property({
    type: 'string',
  })
  status?: string;

  @property({
    type: 'date',
  })
  createdAt?: string;

  @property({
    type: 'date',
  })
  updatedAt?: string;

  constructor(data?: Partial<Application>) {
    super(data);
  }
}
