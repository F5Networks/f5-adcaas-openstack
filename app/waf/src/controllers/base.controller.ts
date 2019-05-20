import {RestBindings, RequestContext} from '@loopback/rest';
import {inject} from '@loopback/core';
import {WafBindingKeys} from '../keys';

export class BaseController {
  protected tenantId: Promise<string>;

  constructor(
    @inject(RestBindings.Http.CONTEXT)
    protected reqCxt: RequestContext,
  ) {
    //TODO: This is a workaround to run UT. Some UT codes call this
    //construct before case starts to stub controller's members.
    //We can assume reqCxt is always input correctly in the real world.
    if (!this.reqCxt) return;

    this.tenantId = this.reqCxt.get(WafBindingKeys.Request.KeyTenantId);
  }
}
