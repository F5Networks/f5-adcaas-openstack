import {Condition, Action} from '../models';
import {model, property, hasMany} from '@loopback/repository';
import {CommonEntity} from '.';

@model()
export class Rule extends CommonEntity {
  @property({
    type: 'string',
    required: false,
    schema: {
      response: true,
      example: '2d3h896a-4d82-40ee-8d08-55550db1234',
    },
  })
  endpointpolicyId: string;

  @hasMany(() => Condition, {keyTo: 'ruleId'})
  conditions?: Condition[];

  @hasMany(() => Action, {keyTo: 'ruleId'})
  actions?: Action[];

  constructor(data?: Partial<Rule>) {
    super(data);
  }
}
