import {Entity, model, property} from '@loopback/repository';

@model()
export class Rule extends Entity {
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
    type: 'boolean',
    required: true,
    default: false,
  })
  default: boolean;

  @property({
    type: 'string',
    required: true,
  })
  pattern: string;

  @property({
    type: 'string',
    required: true,
  })
  wafpolicy: string;

  constructor(data?: Partial<Rule>) {
    super(data);
  }
}
