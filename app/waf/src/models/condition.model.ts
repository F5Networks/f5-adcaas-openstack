import {Entity, model, property} from '@loopback/repository';

@model()
export class Condition extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  id: string;
  @property({
    type: 'object',
    required: false,
  })
  all: object;

  @property({
    type: 'object',
    required: false,
  })
  alpn: object;

  @property({
    type: 'string',
    required: false,
    default: 'request',
  })
  event: string;

  @property({
    type: 'object',
    required: false,
  })
  extension: object;

  @property({
    type: 'object',
    required: false,
  })
  host: object;

  @property({
    type: 'number',
    required: false,
  })
  index: number;

  @property({
    type: 'string',
    required: false,
  })
  name: string;

  @property({
    type: 'boolean',
    required: false,
    default: false,
  })
  normalized: boolean;

  @property({
    type: 'object',
    required: false,
  })
  npn: object;

  @property({
    type: 'object',
    required: false,
  })
  path: object;

  @property({
    type: 'object',
    required: false,
  })
  pathSegment: object;

  @property({
    type: 'object',
    required: false,
  })
  port: object;

  @property({
    type: 'object',
    required: false,
  })
  queryParameter: object;

  @property({
    type: 'object',
    required: false,
  })
  queryString: object;

  @property({
    type: 'object',
    required: false,
  })
  scheme: object;

  @property({
    type: 'object',
    required: false,
  })
  serverName: object;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'object',
    required: false,
  })
  unnamedQueryParameter: object;

  @property({
    type: 'string',
    required: true,
  })
  ruleId: string;

  constructor(data?: Partial<Condition>) {
    super(data);
  }
}
