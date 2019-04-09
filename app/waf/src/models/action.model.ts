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
    schema: {
      create: true,
      response: true,
      example: 'request',
    },
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
    schema: {
      create: true,
      response: true,
      example: 'http://1.2.3.4/index.html',
    },
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
    required: false,
    schema: {
      create: true,
      response: true,
      example: 'httpUri',
    },
  })
  type: string;

  @property({
    type: 'string',
    required: true,
    schema: {
      response: true,
      example: '2d3h896a-2312-40ee-8d08-55550dbc191',
    },
  })
  ruleId: string;

  constructor(data?: Partial<Action>) {
    super(data);
  }
}
