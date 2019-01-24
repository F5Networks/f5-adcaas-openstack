import {Entity, model, property} from '@loopback/repository';

@model()
export class Adc extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
    required: true,
  })
  host: string;

  @property({
    type: 'number',
    required: false,
    default: 443,
  })
  port: number;

  @property({
    type: 'string',
    required: false,
    default: 'admin',
  })
  username: string;

  @property({
    type: 'string',
    required: false,
    default: 'admin',
  })
  passphrase: string;

  constructor(data?: Partial<Adc>) {
    super(data);
  }
}
