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
  })
  description?: string;

  @property({
    type: 'string',
    required: true,
  })
  declaration: string;

  @property({
    type: 'string',
  })
  status?: string;

  @property({
    type: 'date',
  })
  created_at?: string;

  @property({
    type: 'date',
  })
  updated_at?: string;

  @property({
    type: 'string',
  })
  wafpolicy_id?: string;

  constructor(data?: Partial<Application>) {
    super(data);
  }
}
