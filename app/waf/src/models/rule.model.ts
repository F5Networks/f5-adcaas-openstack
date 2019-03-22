import {Condition, Action} from '../models';
import {Entity, model, property, hasMany} from '@loopback/repository';

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

  @hasMany(() => Condition, {keyTo: 'ruleId'})
  conditions?: Condition[];

  @hasMany(() => Action, {keyTo: 'ruleId'})
  actions?: Action[];

  @property({
    type: 'string',
    required: true,
  })
  endpointpolicyId: string;

  constructor(data?: Partial<Rule>) {
    super(data);
  }
}
