import {model, property} from '@loopback/repository';
import {CommonEntity, AS3JSONObject} from '.';

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
  content: AS3JSONObject;

  constructor(data?: Partial<Declaration>) {
    super(data);

    this.content = {};
  }
}
