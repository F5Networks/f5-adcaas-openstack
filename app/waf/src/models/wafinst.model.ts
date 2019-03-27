import { model, property } from '@loopback/repository';
import { CommonEntity } from '.';

@model({ settings: { strict: false } })
export class WafInst extends CommonEntity {
  @property({
    type: 'string',
    required: true,
  })
  platformType: string;

  @property({
    type: 'object',
  })
  networks?: object;

  @property({
    type: 'object',
  })
  subnets?: object;

  @property({
    type: 'object',
  })
  ports?: object;

  @property({
    type: 'string',
  })
  image?: string;

  @property({
    type: 'string',
  })
  flavor?: string;

  @property({
    type: 'string',
    required: true,
    default: 'NOTPROV',
  })
  status: string;

  @property({
    type: 'string',
  })
  mgmtIp: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  //[prop: string]: any;

  constructor(data?: Partial<WafInst>) {
    super(data);
  }
}
