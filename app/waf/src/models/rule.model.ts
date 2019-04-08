import {Condition, Action} from '../models';
import {model, property, hasMany} from '@loopback/repository';
import {CommonEntity} from '.';

@model()
export class Rule extends CommonEntity {
 
  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    default: [],
    schema: {
      create: true,
      update: true,
      response: true,
      example: [
        '23442d6a-4d82-40ee-8d08-243750dbc191',
        'aaaabbda-4d82-40ee-8d08-243750dbc192',
      ],
    },
  })
  @hasMany(() => Condition, {keyTo: 'ruleId'})
  conditions?: Condition[];
  
  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    default: [],
    schema: {
      create: true,
      update: true,
      response: true,
      example: [
        '23442d6a-4d82-40ee-8d08-243750dbc191',
        'aaaabbda-4d82-40ee-8d08-243750dbc192',
      ],
    },
  })
  @hasMany(() => Action, {keyTo: 'ruleId'})
  actions?: Action[];

  @property({
    type: 'string',
    required: false,
    schema: {
      response: true,
      example: '2d3h896a-4d82-40ee-8d08-55550dbc191',
    },
  })
  endpointpolicyId: string;

  constructor(data?: Partial<Rule>) {
    super(data);
  }
}
