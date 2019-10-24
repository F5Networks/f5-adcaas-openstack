/**
 * Copyright 2019 F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {model, property} from '@loopback/repository';
import {CommonEntity} from '../common.model';

@model()
export class ProfileHttpProfile extends CommonEntity {
  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    default: [],
    schema: {
      create: true,
      update: true,
      response: true,
      example: ['content-type', 'cookie'],
      openapi: {
        items: {
          type: 'string',
          maxLength: 64,
        },
      },
    },
    as3: {},
  })
  allowedResponseHeaders: string[];

  @property({
    type: 'string',
    required: false,
    default:
      '<html><head><title>Bad Request</title></head><body><h2>Invalid proxy request</h2></body></html>',
    schema: {
      create: true,
      update: true,
      response: true,
      example:
        '<html><head><title>Bad Request</title></head><body><h2>Invalid proxy request</h2></body></html>',
      openapi: {
        minLength: 0,
        maxLength: 4096,
      },
    },
    as3: {},
  })
  badRequestMessage: string;

  @property({
    type: 'string',
    required: false,
    default:
      '<html><head><title>Bad Response</title></head><body><h2>Proxy request provoked invalid response</h2></body></html>',
    schema: {
      create: true,
      update: true,
      response: true,
      example:
        '<html><head><title>Bad Response</title></head><body><h2>Proxy request provoked invalid response</h2></body></html>',
      openapi: {
        minLength: 0,
        maxLength: 4096,
      },
    },
    as3: {},
  })
  badResponseMessage: string;

  @property({
    type: 'string',
    required: false,
    default:
      '<html><head><title>Connection Error</title></head><body><h2>Unable to connect to host in proxy request</h2></body></html>',
    schema: {
      create: true,
      update: true,
      response: true,
      example:
        '<html><head><title>Connection Error</title></head><body><h2>Unable to connect to host in proxy request</h2></body></html>',
      openapi: {
        minLength: 0,
        maxLength: 4096,
      },
    },
    as3: {},
  })
  connectErrorMessage: string;

  // Used to create secret key for cookie encryption (when missing, AS3 uses a system-generated key)
  // @property({
  //   type: 'object',
  //   required: false,
  //   schema: {
  //     create: true,
  //     update: true,
  //     response: true,
  //     example: { format: "<HTTP_Profile_cookiePassphrase | Secret>" },
  //     openapi: {
  //       ....
  //     },
  //   },
  //   as3: {},
  // })
  // connectErrorMessage?: HTTP_Profile_cookiePassphrase | Secret;

  @property({
    type: 'string',
    required: false,
    default: 'deny',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'allow',
      openapi: {
        enum: ['deny', 'allow'],
      },
    },
    as3: {},
  })
  defaultConnectAction: string;

  @property({
    type: 'string',
    required: false,
    default:
      '<html><head><title>DNS Resolution Error</title></head><body><h2>Cannot resolve hostname in proxy request</h2></body></html>',
    schema: {
      create: true,
      update: true,
      response: true,
      example:
        '<html><head><title>DNS Resolution Error</title></head><body><h2>Cannot resolve hostname in proxy request</h2></body></html>',
      openapi: {
        minLength: 0,
        maxLength: 4096,
      },
    },
    as3: {},
  })
  dnsErrorMessage: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: ['hosta', 'hostb'],
      openapi: {
        items: {
          type: 'string',
          maxLength: 256,
        },
      },
    },
    as3: {},
  })
  doNotProxyHosts?: string[];

  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: ['content-type', 'cookie'],
      openapi: {
        items: {
          type: 'string',
          maxLength: 4096,
        },
      },
    },
    as3: {},
  })
  encryptCookies?: string[];

  // {"status":422,"message":"declaration is invalid","errors":["/F5_610be7617fff469c88b71301cffd4c06/F5_7ed1ed90_cc91_43cc_8908_90174f7f9d5c/F5_ff2709e5_992e_40bb_9388_912e7042fa3b: then is NOT valid"],"level":"warning"}
  // @property({
  //   type: 'string',
  //   required: false,
  //   default: 'pass-through',
  //   schema: {
  //     create: true,
  //     update: true,
  //     response: true,
  //     example: 'reject',
  //     openapi: {
  //       enum: ['pass-through', 'reject'],
  //     },
  //   },
  //   as3: {},
  // })
  // excessClientHeaders: string;

  // {"status":422,"message":"declaration is invalid","errors":["/F5_610be7617fff469c88b71301cffd4c06/F5_7ed1ed90_cc91_43cc_8908_90174f7f9d5c/F5_ff2709e5_992e_40bb_9388_912e7042fa3b: then is NOT valid"],"level":"warning"}
  // @property({
  //   type: 'string',
  //   required: false,
  //   default: 'pass-through',
  //   schema: {
  //     create: true,
  //     update: true,
  //     response: true,
  //     example: 'reject',
  //     openapi: {
  //       enum: ['pass-through', 'reject'],
  //     },
  //   },
  //   as3: {},
  // })
  // excessServerHeaders: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'http://example.com',
      openapi: {
        minLength: 0,
        maxLength: 4096,
      },
    },
    as3: {},
  })
  fallbackRedirect?: string;

  @property({
    type: 'array',
    itemType: 'number',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: [400, 401],
      openapi: {
        items: {
          type: 'number',
          minimum: 100,
          maximum: 999,
        },
      },
    },
    as3: {},
  })
  fallbackStatusCodes?: number[];

  @property({
    type: 'boolean',
    required: false,
    default: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: true,
    },
    as3: {},
  })
  hstsIncludeSubdomains: boolean;

  @property({
    type: 'boolean',
    required: false,
    default: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: true,
    },
    as3: {},
  })
  hstsInsert: boolean;

  @property({
    type: 'number',
    required: false,
    default: 7862400,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 7862400,
      openapi: {
        type: 'integer',
        minimum: 0,
        maximum: 31557600,
      },
    },
    as3: {},
  })
  hstsPeriod: number;

  @property({
    type: 'boolean',
    required: false,
    default: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: true,
    },
    as3: {},
  })
  hstsPreload: boolean;

  // You may insert one header into each request before AS3 sends it to a pool member.
  // The header value may be a simple string or the result of an iRules TCL expression (for example, [IP::client_addr]).
  // This is the most efficient way to insert a single header; to insert multiple headers use an iRule or an Endpoint policy
  // @property({
  //   type: 'object',
  //   required: false,
  //   schema: {
  //     create: true,
  //     update: true,
  //     response: true,
  //     example: { format: "<HTTP_Profile_insertHeader>" },
  //     openapi: {
  //       ....
  //     },
  //   },
  //   as3: {},
  // })
  // insertHeader?: HTTP_Profile_insertHeader;

  @property({
    type: 'boolean',
    required: false,
    default: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: true,
    },
    as3: {},
  })
  ipv6: boolean;

  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    default: [
      'CONNECT',
      'DELETE',
      'GET',
      'HEAD',
      'LOCK',
      'OPTIONS',
      'POST',
      'PROPFIND',
      'PUT',
      'TRACE',
      'UNLOCK',
    ],
    schema: {
      create: true,
      update: true,
      response: true,
      example: [],
      openapi: {
        items: {
          type: 'string',
          maxLength: 32,
        },
      },
    },
    as3: {},
  })
  knownMethods: string[];

  @property({
    type: 'number',
    required: false,
    default: 64,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 64,
      openapi: {
        type: 'integer',
        minimum: 1,
        maximum: 1024,
      },
    },
    as3: {},
  })
  maxHeaderCount: number;

  @property({
    type: 'number',
    required: false,
    default: 32768,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 32768,
      openapi: {
        type: 'integer',
        minimum: 9,
        maximum: 262144,
      },
    },
    as3: {},
  })
  maxHeaderSize: number;

  @property({
    type: 'number',
    required: false,
    default: 0,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 0,
      openapi: {
        type: 'integer',
        minimum: 0,
        maximum: 2147483647,
      },
    },
    as3: {},
  })
  maxRequests: number;

  @property({
    type: 'boolean',
    required: false,
    default: true,
    schema: {
      create: true,
      update: true,
      response: true,
      example: true,
    },
    as3: {},
  })
  multiplexTransformations: boolean;

  @property({
    type: 'array',
    itemType: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: [],
      openapi: {
        items: {
          type: 'string',
          // maxLength: ??,
        },
      },
    },
    as3: {},
  })
  otherXFF?: string[];

  //{"status":422,"message":"declaration is invalid","errors":["/F5_610be7617fff469c88b71301cffd4c06/F5_7ed1ed90_cc91_43cc_8908_90174f7f9d5c/F5_ff2709e5_992e_40bb_9388_912e7042fa3b: then is NOT valid"],"level":"warning"}
  // @property({
  //   type: 'string',
  //   required: false,
  //   default: 'pass-through',
  //   schema: {
  //     create: true,
  //     update: true,
  //     response: true,
  //     example: 'pass-through',
  //     openapi: {
  //       enum: ['pass-through', 'reject'],
  //     },
  //   },
  //   as3: {},
  // })
  // oversizeClientHeaders: string;

  //{"status":422,"message":"declaration is invalid","errors":["/F5_610be7617fff469c88b71301cffd4c06/F5_7ed1ed90_cc91_43cc_8908_90174f7f9d5c/F5_ff2709e5_992e_40bb_9388_912e7042fa3b: then is NOT valid"],"level":"warning"}
  // @property({
  //   type: 'string',
  //   required: false,
  //   default: 'pass-through',
  //   schema: {
  //     create: true,
  //     update: true,
  //     response: true,
  //     example: 'pass-through',
  //     openapi: {
  //       enum: ['pass-through', 'reject'],
  //     },
  //   },
  //   as3: {},
  // })
  // oversizeServerHeaders: string;

  @property({
    type: 'string',
    required: false,
    default: 'allow',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'allow',
      openapi: {
        enum: ['allow', 'pass-through', 'reject'],
      },
    },
    as3: {},
  })
  pipelineAction: string;

  @property({
    type: 'string',
    required: false,
    default: 'reverse',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'reverse',
      openapi: {
        enum: ['reverse', 'transparent', 'explicit'],
      },
    },
    as3: {},
  })
  proxyType: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: '',
      openapi: {
        minLength: 0,
        maxLength: 4096,
      },
    },
    as3: {},
  })
  remark?: string;

  @property({
    type: 'string',
    required: false,
    default: 'preserve',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'preserve',
      openapi: {
        enum: ['preserve', 'selective', 'rechunk'],
      },
    },
    as3: {},
  })
  requestChunking: string;

  // AS3 pointer to DNS resolver used to resolve hostnames in client requests
  // @property({
  //   type: 'object',
  //   required: false,
  //   schema: {
  //     create: true,
  //     update: true,
  //     response: true,
  //     example: { format: "<HTTP_Profile_resolver>" },
  //     openapi: {
  //       ....
  //     },
  //   },
  //   as3: {},
  // })
  // resolver?: HTTP_Profile_resolver;

  @property({
    type: 'string',
    required: false,
    default: 'selective',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'selective',
      openapi: {
        enum: ['selective', 'preserve', 'unchunk', 'rechunk'],
      },
    },
    as3: {},
  })
  responseChunking: string;

  @property({
    type: 'string',
    required: false,
    default: 'none',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'none',
      openapi: {
        enum: ['none', 'all', 'matching', 'addresses'],
      },
    },
    as3: {},
  })
  rewriteRedirects: string;

  @property({
    type: 'number',
    required: false,
    default: 0,
    schema: {
      create: true,
      update: true,
      response: true,
      example: 0,
      openapi: {
        type: 'integer',
        minimum: 0,
        maximum: 65535,
      },
    },
    as3: {},
  })
  routeDomain: number;

  @property({
    type: 'string',
    required: false,
    default: 'BigIP',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'BigIP',
      openapi: {
        enum: ['BigIP'],
      },
    },
    as3: {},
  })
  serverHeaderValue: string;

  @property({
    type: 'boolean',
    required: false,
    default: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: true,
    },
    as3: {},
  })
  truncatedRedirects: boolean;

  @property({
    type: 'boolean',
    required: false,
    default: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: true,
    },
    as3: {},
  })
  trustXFF: boolean;

  @property({
    type: 'string',
    required: false,
    default: 'http-tunnel',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'http-tunnel',
      openapi: {
        enum: ['http-tunnel'],
      },
    },
    as3: {},
  })
  tunnelName: string;

  @property({
    type: 'string',
    required: false,
    default: 'allow',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'allow',
      openapi: {
        enum: ['allow', 'pass-through', 'reject'],
      },
    },
    as3: {},
  })
  unknownMethodAction: string;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: '',
      openapi: {},
    },
    as3: {},
  })
  viaHost?: string;

  @property({
    type: 'string',
    required: false,
    default: 'remove',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'remove',
      openapi: {
        enum: ['remove', 'append', 'preserve'],
      },
    },
    as3: {},
  })
  viaRequest: string;

  @property({
    type: 'string',
    required: false,
    default: 'remove',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'remove',
      openapi: {
        enum: ['remove', 'append', 'preserve'],
      },
    },
    as3: {},
  })
  viaResponse: string;

  @property({
    type: 'string',
    required: false,
    default: 'unmask',
    schema: {
      create: true,
      update: true,
      response: true,
      example: 'unmask',
      openapi: {
        enum: ['unmask', 'preserve', 'remask', 'selective'],
      },
    },
    as3: {},
  })
  webSocketMasking: string;

  @property({
    type: 'boolean',
    required: false,
    default: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: true,
    },
    as3: {},
  })
  webSocketsEnabled: boolean;

  @property({
    type: 'string',
    required: false,
    schema: {
      create: true,
      update: true,
      response: true,
      example: '',
      openapi: {
        minLength: 0,
        maxLength: 4096,
      },
    },
    as3: {},
  })
  whiteOutHeader?: string;

  @property({
    type: 'boolean',
    required: false,
    default: true,
    schema: {
      create: true,
      update: true,
      response: true,
      example: true,
    },
    as3: {},
  })
  xForwardedFor: boolean;

  constructor(data?: Partial<ProfileHttpProfile>) {
    super(data);
    this.as3Class = 'HTTP_Profile';
  }
}
