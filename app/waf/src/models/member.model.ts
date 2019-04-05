import {model, property} from '@loopback/repository';
import {CommonEntity} from '.';

@model()
export class Member extends CommonEntity {
  @property({
    type: 'string',
    required: true,
    schema: {
      create: true,
      update: true,
      response: true,
      example: '192.168.1.12',
    },
  })
  address: string;

  @property({
    type: 'number',
    required: true,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 80,
    },
  })
  port: number;

  @property({
    type: 'string',
    required: true,
    schema: {
      response: true,
      example: '2d3h896a-4d82-40ee-8d08-55550dbc191',
    },
  })
  poolId: string;

  constructor(data?: Partial<Member>) {
    super(data);
  }
}
