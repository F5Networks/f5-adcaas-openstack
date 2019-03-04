import {Entity, model, property} from '@loopback/repository';

@model()
export class Rule extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'boolean',
    required: false,
    default: false,
  })
  default: boolean;

  @property({
    type: 'string',
    required: false,
    default: '',
  })
  pattern: string;

  @property({
    type: 'string',
    required: false,
    default: '',
  })
  wafpolicy: string;

  constructor(data?: Partial<Rule>) {
    super(data);
  }
}
