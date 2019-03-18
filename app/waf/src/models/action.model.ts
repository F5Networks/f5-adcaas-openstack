import {model, property} from '@loopback/repository';
import {CommonEntity} from '.';

@model()
export class Action extends CommonEntity {
  @property({
    type: 'boolean',
    required: false,
    default: true,
  })
  enabled: boolean;

  @property({
    type: 'string',
    required: false,
    default: 'request',
  })
  event: string;

  @property({
    type: 'object',
    required: false,
  })
  insert: object;

  @property({
    type: 'string',
    required: false,
  })
  location: string;

  @property({
    type: 'object',
    required: false,
  })
  policy: object;

  @property({
    type: 'object',
    required: false,
  })
  remove: object;

  @property({
    type: 'object',
    required: false,
  })
  replace: object;

  @property({
    type: 'object',
    required: false,
  })
  select: object;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  ruleId: string;

  constructor(data?: Partial<Action>) {
    super(data);
  }
}
