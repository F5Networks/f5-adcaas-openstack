import {model, property} from '@loopback/repository';
import {CommonEntity, AS3Declaration, Wafpolicy} from '.';

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
    schema: {
      create: true,
      update: true,
      response: true,
    },
    as3: {},
  })
  insert?: object;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      response: true,
      example: 'http://1.2.3.4/index.html',
    },
  })
  location?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: '2d3h896a-2312-40ee-8d08-55550dbc191',
    },
    as3: {
      type: 'use',
    },
  })
  policy?: string;

  wafpolicy?: Wafpolicy;

  @property({
    type: 'object',
    required: false,
  })
  remove?: object;

  @property({
    type: 'object',
    required: false,
    as3: {},
  })
  replace?: object;

  @property({
    type: 'object',
    required: false,
  })
  select?: object;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      response: true,
      required: true,
      example: 'httpUri',
    },
    as3: {},
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

  getAS3Declaration(): AS3Declaration {
    let obj = super.getAS3Declaration();

    delete obj.class;
    delete obj.label;
    delete obj.remark;

    return obj;
  }
}
