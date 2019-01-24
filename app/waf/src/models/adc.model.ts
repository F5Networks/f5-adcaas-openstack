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
  })
  host?: string;

  @property({
    type: 'number',
  })
  port?: number;

  @property({
    type: 'string',
  })
  username?: string;

  @property({
    type: 'string',
  })
  passphrase?: string;

  constructor(data?: Partial<Adc>) {
    super(data);
  }
}
