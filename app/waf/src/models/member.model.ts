import {Entity, model, property} from '@loopback/repository';

@model()
export class Member extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  address: string;

  @property({
    type: 'number',
    required: true,
  })
  port: number;

  constructor(data?: Partial<Member>) {
    super(data);
  }
}
