import {Request, RestBindings, get, ResponseObject} from '@loopback/rest';
import {inject} from '@loopback/context';
import {AS3Service} from '../services';

const AS3_HOST: string = process.env.AS3_HOST || 'localhost';
const AS3_PORT: number = Number(process.env.AS3_PORT) || 8443;

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

const prefix = '/adcaas/v1';

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,
    @inject('services.AS3Service') private as3Service: AS3Service,
  ) {}

  // Map to `GET /ping`
  @get(prefix + '/ping', {
    responses: {
      '200': PING_RESPONSE,
    },
  })
  async ping(): Promise<object> {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from F5 ADCaaS for OpenStack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
      as3: await this.getAS3Info(),
    };
  }

  async getAS3Info(): Promise<string> {
    try {
      return await this.as3Service.info(AS3_HOST, AS3_PORT);
    } catch (e) {
      return e.message;
    }
  }
}
