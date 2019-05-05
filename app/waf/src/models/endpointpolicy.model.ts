import {model, hasMany} from '@loopback/repository';
import {CommonEntity, AS3Declaration, Rule} from '.';

@model()
export class Endpointpolicy extends CommonEntity {
  @hasMany(() => Rule, {keyTo: 'endpointpolicyId'})
  rules: Rule[] = [];

  constructor(data?: Partial<Endpointpolicy>) {
    super(data);

    this.as3Class = 'Endpoint_Policy';
  }

  getAS3Declaration(): AS3Declaration {
    let obj = super.getAS3Declaration();

    obj.rules = this.rules.map(rule => rule.getAS3Declaration());

    return obj;
  }
}
