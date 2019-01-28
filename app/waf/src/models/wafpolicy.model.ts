import {Entity, model, property} from '@loopback/repository';

@model()
export class Wafpolicy extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  content?: string;

  @property({
    type: 'boolean',
    required: true,
  })
  shared: boolean;

  @property({
    type: 'array',
    itemType: 'string',
  })
  tenant?: string[];

  @property({
    type: 'date',
  })
  createdAt?: string;

  constructor(data?: Partial<Wafpolicy>) {
    super(data);
  }
}
