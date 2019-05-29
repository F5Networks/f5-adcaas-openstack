import {Wafpolicy} from '.';
import {model, property} from '@loopback/repository';

@model()
export class WafpolicyOnDevice extends Wafpolicy {
  @property({
    type: 'string',
    required: false,
    schema: {
      response: true,
    },
  })
  state?: string;

  constructor(data?: Partial<Wafpolicy>) {
    super(data);
  }
}
