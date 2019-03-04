import {model, property} from '@loopback/repository';
import {CommonEntity, CommonResponse, CommonCollectionResponse} from '.';

@model()
export class Adc extends CommonEntity {
  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  host: string;

  @property({
    type: 'number',
    required: false,
    default: 443,
  })
  port: number;

  @property({
    type: 'string',
    required: false,
    default: 'admin',
  })
  username: string;

  @property({
    type: 'string',
    required: false,
    default: 'admin',
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
