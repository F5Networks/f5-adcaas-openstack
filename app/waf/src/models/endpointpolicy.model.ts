import {model, hasMany} from '@loopback/repository';
import {CommonEntity} from '.';
import {Rule} from '../models';

@model()
export class Endpointpolicy extends CommonEntity {
  @hasMany(() => Rule, {keyTo: 'endpointpolicyId'})
  rules?: Rule[];

  constructor(data?: Partial<Endpointpolicy>) {
    super(data);
  }
}
