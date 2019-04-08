import {model, property,hasMany} from '@loopback/repository';
import {CommonEntity} from '.';
import {Rule} from '../models';

@model()
export class Endpointpolicy extends CommonEntity {
  
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
  
  @hasMany(() => Rule, {keyTo: 'endpointpolicyId'})
  rules?: Rule[];

  constructor(data?: Partial<Endpointpolicy>) {
    super(data);
  }
}
