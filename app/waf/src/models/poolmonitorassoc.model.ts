import {model, property, Entity} from '@loopback/repository';

@model()
export class PoolMonitorAssociation extends Entity {
  @property({
    type: 'string',
    required: true,
    id: true,
  })
  poolId: string;

  @property({
    type: 'string',
    required: true,
  })
  monitorId: string;

  constructor(data?: Partial<PoolMonitorAssociation>) {
    super(data);
  }
}
