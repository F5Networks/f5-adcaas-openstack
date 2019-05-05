import {model, property, hasMany} from '@loopback/repository';
import {CommonEntity, AS3Declaration, Condition, Action} from '.';

@model()
export class Rule extends CommonEntity {
  @property({
    type: 'string',
    required: true,
    schema: {
      response: true,
      example: '2d3h896a-4d82-40ee-8d08-55550db1234',
    },
  })
  endpointpolicyId: string;

  @hasMany(() => Condition, {keyTo: 'ruleId'})
  conditions: Condition[] = [];

  @hasMany(() => Action, {keyTo: 'ruleId'})
  actions: Action[] = [];

  constructor(data?: Partial<Rule>) {
    super(data);
  }

  getAS3Declaration(): AS3Declaration {
    let obj: AS3Declaration = {
      name: this.name,
    };

    obj.conditions = this.conditions.map(condition =>
      condition.getAS3Declaration(),
    );

    obj.actions = this.actions.map(action => action.getAS3Declaration());

    return obj;
  }
}
