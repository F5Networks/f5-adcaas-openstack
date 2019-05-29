import {CommonEntity} from '.';
import {model, property} from '@loopback/repository';

@model()
export class Wafpolicy extends CommonEntity {
  @property({
    type: 'string',
    required: false,
    schema: {
      response: true,
      example: '/Common/my_waf',
    },
    as3: {},
  })
  file?: string;

  @property({
    type: 'boolean',
    required: false,
    default: false,
  })
  ignoreChanges: boolean;

  @property({
    type: 'string',
    required: true,
    schema: {
      create: true,
      update: true,
      response: true,
      required: true,
      example: 'https://raw.githubusercontent.com/wafrepo/master/my_waf.xml',
    },
    as3: {},
  })
  url: string;

  @property({
    type: 'boolean',
    schema: {
      create: true,
      update: true,
      response: true,
    },
    required: false,
    default: false,
  })
  public: boolean;

  constructor(data?: Partial<Wafpolicy>) {
    super(data);
    this.as3Class = 'WAF_Policy';
  }
}
