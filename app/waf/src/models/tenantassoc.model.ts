import {Entity, model, property} from '@loopback/repository';

@model()
export class AdcTenantAssociation extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  adcId: string;

  @property({
    type: 'string',
    id: true,
    required: true,
  })
  tenantId: string;

  constructor(data?: Partial<AdcTenantAssociation>) {
    super(data);
  }
}

export class Tenant extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
    schema: {
      response: true,
      example: '11111111-2222-3333-4444-555555555555',
    },
  })
  id: string;

  constructor(data?: Partial<Tenant>) {
    super(data);
  }
}
