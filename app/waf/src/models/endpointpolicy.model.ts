import {Entity, model, property} from '@loopback/repository';

@model()
export class Endpointpolicy extends Entity {
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
  name: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  rules: string[];

  constructor(data?: Partial<Endpointpolicy>) {
    super(data);
  }
}
