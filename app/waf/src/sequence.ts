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
  Request,
  HttpErrors,
} from '@loopback/rest';
import {factory} from './log4ts';
import uuid = require('uuid');
import {AuthWithOSIdentity, AuthedToken} from './services';
import {CoreBindings} from '@loopback/core';
import {WafApplication} from '.';
import {bindingKeyAdminAuthedToken} from './components';

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
    @inject('services.openstack.AuthWithOSIdentity')
    private authWithOSIdentity: AuthWithOSIdentity,
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: WafApplication,
  ) {}

  async handle(context: RequestContext) {
    let logUuid = uuid();
    await this.logRequest(logUuid, context);

    let result: object = {};
    try {
      const {request, response} = context;

      //await this.authRequest(request);

      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);

      result = await this.invoke(route, args);
      this.send(response, result);
    } catch (err) {
      this.reject(context, err);
    } finally {
      await this.logResponse(logUuid, context, result);
    }
  }

  async logRequest(logUuid: string, context: RequestContext): Promise<void> {
    const req = context.request;
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
    const res = context.response;

    const logObj = {
      uuid: logUuid,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      headers: res.getHeaders(),
      body: result,
    };

    this.logger.info('Response: ' + JSON.stringify(logObj));
  }

  async authRequest(request: Request) {
    if (!process.env.PRODUCT_RELEASE) return;

    this.logger.debug('start to authenticate user');

    let userToken = request.header('X-Auth-Token');
    if (typeof userToken !== typeof '') {
      throw new HttpErrors.Unauthorized(
        'Unauthorized: invalid X-Auth-Token header.',
      );
    }

    const authedToken = await this.application.get<AuthedToken>(
      bindingKeyAdminAuthedToken,
    );
    await this.authWithOSIdentity
      .validateUserToken(authedToken.token, <string>userToken)
      .then(
        authedObj => {
          // ...
          this.logger.debug('Authenticated OK');
          this.logger.debug(JSON.stringify(authedObj));
        },
        notAuthed => {
          throw new HttpErrors.Unauthorized(
            'Unauthorized: invalid user token.',
          );
        },
      );
  }
}
