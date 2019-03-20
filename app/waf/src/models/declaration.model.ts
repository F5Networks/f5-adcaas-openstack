import {model, property} from '@loopback/repository';
import {CommonEntity} from '.';

@model()
export class Declaration extends CommonEntity {
  @property({
    type: 'string',
    required: true,
    schema: {
      response: true,
      example: '11111111-2222-3333-4444-555555555555',
    },
  })
  applicationId: string;

  @property({
    type: 'object',
    required: true,
    schema: {
      response: true,
      example: {},
    },
  })
  content: object;

  //TODO: implement something like lastError to record deploy result

  constructor(data?: Partial<Declaration>) {
    super(data);
  }
}
