import {inject} from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import {factory} from './log4ts';
import uuid = require('uuid');

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject('logger', {optional: true})
    private logger = factory.getLogger('api.call'),
  ) {}

  async handle(context: RequestContext) {
    let logUuid = uuid();
    await this.logRequest(logUuid, context);

    let result: object = {};
    try {
      const {request, response} = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);

      result = await this.invoke(route, args);
      this.send(response, result);
    } catch (err) {
      this.reject(context, err);
    }

    // TODO: remove this workaround after fix response log issue.
    if (context.request.url.startsWith('/adcaas')) {
      await this.logResponse(logUuid, context, result);
    }
  }

  async logRequest(logUuid: string, context: RequestContext): Promise<void> {
    const req = await context.get(RestBindings.Http.REQUEST);
    const logObj = {
      uuid: logUuid,
      method: req.method,
      headers: req.headers,
      path: req.path,
      params: req.params,
      body: req.body,
      cookies: req.cookies,
      // others.
    };
    this.logger.info('Request: ' + JSON.stringify(logObj));
  }
  async logResponse(
    logUuid: string,
    context: RequestContext,
    result: object,
  ): Promise<void> {
    console.log(RestBindings.Http.RESPONSE);
    const res = await context.get(RestBindings.Http.RESPONSE);
    console.log('post of ' + RestBindings.Http.RESPONSE);

    const logObj = {
      uuid: logUuid,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      headers: res.getHeaders(),
      body: result,
    };

    this.logger.info('Response: ' + JSON.stringify(logObj));
  }
}
