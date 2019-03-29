import {Entity} from '@loopback/repository';

let plural = require('plural');

export class Response {
  [key: string]: Entity;

  constructor(t: typeof Entity, data: Entity) {
    this[t.modelName.toLowerCase()] = data;
  }
}

export class CollectionResponse {
  [key: string]: Entity[];

  constructor(t: typeof Entity, data: Entity[]) {
    this[plural(t.modelName.toLowerCase())] = data;
  }
}
