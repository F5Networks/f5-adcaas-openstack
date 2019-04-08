import {Entity, model, property} from '@loopback/repository';

@model()
export class MemberMonitorAssociation extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  memberId: string;

  @property({
    type: 'string',
    id: true,
    required: true,
  })
  monitorId: string;

  constructor(data?: Partial<MemberMonitorAssociation>) {
    super(data);
  }
}
