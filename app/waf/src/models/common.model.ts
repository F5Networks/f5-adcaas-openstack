import {Entity, model, property} from '@loopback/repository';
import uuid = require('uuid');

@model()
export abstract class CommonEntity extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: false,
  })
  name?: string;

  @property({
    type: 'date',
    required: false,
  })
  createdAt?: string;

  @property({
    type: 'date',
    required: false,
  })
  updatedAt?: string;

  constructor(data?: Partial<CommonEntity>) {
    super(data);

    if (!this.id) {
      this.id = uuid();
    }

    if (!this.createdAt) {
      this.createdAt = new Date().toISOString();
    }
  }
}

export abstract class CommonResponse extends Object {
  [key: string]: Object;

  constructor(resourceName: string, data: CommonEntity) {
    super(data);

    this[resourceName] = data;
  }
}

export abstract class CommonCollectionResponse extends Object {
  [key: string]: Object;

  constructor(collectionName: string, data: CommonEntity[]) {
    super(data);

    this[collectionName] = data;
  }
}
