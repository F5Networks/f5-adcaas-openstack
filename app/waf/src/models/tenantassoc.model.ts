import {Entity, model, property} from '@loopback/repository';

@model()
export class TenantAssociation extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  tenantId: string;

  @property({
    type: 'string',
    required: true,
  })
  adcId: string;

  @property({
    type: 'date',
  })
  createdAt?: string;

  @property({
    type: 'date',
  })
  updatedAt?: string;

  constructor(data?: Partial<TenantAssociation>) {
    super(data);
  }
}
