import {Entity, property} from '@loopback/repository';

export abstract class CommonEntity extends Entity {
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

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'My name',
    },
  })
  name?: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'My description',
    },
  })
  description?: string;

  @property({
    type: 'string',
    required: false,
    //TODO: Need to remove this default value, after we can get it from keystone.
    default: 'default',
    schema: {
      create: true,
      response: true,
      example: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    },
  })
  tenantId: string;

  @property({
    type: 'date',
    required: false,
    schema: {
      response: true,
      example: '2019-03-05T08:40:25.000Z',
    },
  })
  createdAt?: string;

  @property({
    type: 'date',
    required: false,
    schema: {
      response: true,
      example: '2019-03-05T08:40:25.100Z',
    },
  })
  updatedAt?: string;

  constructor(data?: Partial<CommonEntity>) {
    super(data);
  }
}
