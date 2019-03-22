import {model, property} from '@loopback/repository';
import {CommonEntity, CommonResponse, CommonCollectionResponse} from '.';

@model()
export class Adc extends CommonEntity {
  @property({
    type: 'string',
    required: true,
    schema: {
      create: true,
      response: true,
      required: true,
      example: 'HW',
    },
  })
  type: string;

  @property({
    type: 'string',
    required: true,
    schema: {
      create: true,
      required: true,
      response: true,
      example: '192.168.0.1',
    },
  })
  host: string;

  @property({
    type: 'number',
    required: false,
    default: 443,
    schema: {
      create: true,
      response: true,
      example: 8443,
    },
  })
  port: number;

  @property({
    type: 'string',
    required: false,
    default: 'admin',
    schema: {
      create: true,
      response: true,
      example: 'admin',
    },
  })
  username: string;

  @property({
    type: 'string',
    required: false,
    default: 'admin',
    schema: {
      create: true,
      response: true,
      example: 'admin',
    },
  })
  passphrase: string;

  constructor(data?: Partial<Adc>) {
    super(data);
  }
}

export class AdcResponse extends CommonResponse {
  constructor(data: Adc) {
    super('adc', data);
  }
}

export class AdcCollectionResponse extends CommonCollectionResponse {
  constructor(data: Adc[]) {
    super('adcs', data);
  }
}
