import {Entity, model, property} from '@loopback/repository';

@model()
export class ServiceEndpointpolicyAssociation extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  serviceId: string;

  @property({
    type: 'string',
    id: true,
    required: true,
  })
  endpointpolicyId: string;

  constructor(data?: Partial<ServiceEndpointpolicyAssociation>) {
    super(data);
  }
}
