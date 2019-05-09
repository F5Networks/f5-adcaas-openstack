import {RestBindings, RequestContext} from '@loopback/rest';
import {inject} from '@loopback/core';
import {WafBindingKeys} from '../keys';

export class BaseController {
  protected tenantId: Promise<string>;

  constructor(
    @inject(RestBindings.Http.CONTEXT)
    protected reqCxt: RequestContext,
  ) {
    this.tenantId = this.reqCxt.get(WafBindingKeys.Request.KeyTenantId);
  }
}
