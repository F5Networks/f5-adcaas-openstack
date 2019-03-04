import {ParameterObject, ParameterLocation} from '@loopback/openapi-v3-types';
import {MetadataInspector} from '@loopback/metadata';
import {PropertyDefinition, PropertyMap} from '@loopback/repository';
import {Adc} from '../models';

function buildProperties(
  metadata: PropertyMap | undefined,
  propNames: string[],
): {[key: string]: object} {
  let props: {[key: string]: object} = {};

  if (metadata) {
    for (let propName of propNames) {
      props[propName] = {
        type: metadata[propName].type,
      };
    }
  }

  return props;
}

const adcProperties = MetadataInspector.getAllPropertyMetadata<
  PropertyDefinition
>('loopback:model-properties', Adc.prototype);

// TODO: It is betther to have another decorator or something else
// to specify the resource properties of request/response in model
// definition, instead of re-define them here. Need to refactor
// the code in the future.
const adcCreateRequestProperties = buildProperties(adcProperties, [
  'id',
  'name',
  'type',
  'host',
  'port',
  'username',
  'passphrase',
]);

const adcCreateRequestExample = {
  name: 'My BIG-IP',
  type: 'HW',
  host: '192.168.0.1',
  port: 8443,
  username: 'admin',
  passphrase: 'admin',
};

const adcUpdateRequestProperties = buildProperties(adcProperties, ['name']);

const adcUpdateRequestExample = {
  name: 'My BIG-IP',
};

const adcResponseProperties = buildProperties(adcProperties, [
  'id',
  'name',
  'type',
  'host',
  'port',
  'username',
  'passphrase',
  'createdAt',
  'updatedAt',
]);

const adcResponseExample = {
  id: '11111111-2222-3333-4444-555555555555',
  name: 'My BIG-IP',
  type: 'HW',
  host: '192.168.0.1',
  port: 8443,
  username: 'admin',
  passphrase: 'admin',
  createdAt: '2019-03-05T08:40:25.000Z',
  updatedAt: '2019-03-05T08:40:25.100Z',
};

class ErrorResponseSchema {
  public schema = {
    schema: {
      type: 'object',
      required: ['statusCode', 'name', 'message'],
      properties: {
        statusCode: {
          type: 'integer',
          example: 422,
        },
        name: {
          type: 'string',
          example: '',
        },
        message: {
          type: 'string',
          example: '',
        },
        code: {
          type: 'string',
          example: '',
        },
        details: {
          type: 'array',
          example: [{}],
        },
      },
    },
  };

  private constructor() {
    this.schema.schema.properties.details.example.shift();
  }

  public static BadRequest(): ErrorResponseSchema {
    let s = new ErrorResponseSchema();

    s.setStatusCodeExample(400);
    s.setNameExample('BadRequestError');
    s.removeCodeProperty();
    s.removeDetailsProperty();

    return s;
  }

  public static NotFound(): ErrorResponseSchema {
    let s = new ErrorResponseSchema();

    s.setStatusCodeExample(404);
    s.setNameExample('Error');
    s.setMessageExample(
      'Entity not found: XXXX with id "11111111-2222-3333-4444-555555555555"',
    );
    s.setCodeExample('ENTITY_NOT_FOUND');
    s.removeDetailsProperty();

    return s;
  }

  public static UnprocessableEntity(): ErrorResponseSchema {
    let s = new ErrorResponseSchema();

    s.setStatusCodeExample(422);
    s.setNameExample('UnprocessableEntityError');
    s.setMessageExample(
      'The request body is invalid. See error object `details` property for more info.',
    );
    s.setCodeExample('VALIDATION_FAILED');

    return s;
  }

  public setStatusCodeExample(statusCode: number) {
    this.schema.schema.properties.statusCode.example = statusCode;
  }

  public setNameExample(name: string) {
    this.schema.schema.properties.name.example = name;
  }

  public setMessageExample(message: string) {
    this.schema.schema.properties.message.example = message;
  }

  public setCodeExample(code: string) {
    this.schema.schema.properties.code.example = code;
  }

  public addDetailExample(detail: object) {
    this.schema.schema.properties.details.example.push(detail);
  }

  public removeCodeProperty() {
    delete this.schema.schema.properties.code;
  }

  public removeDetailsProperty() {
    delete this.schema.schema.properties.details;
  }
}

function buildParameterSchema(
  name: string,
  location: ParameterLocation,
  required: boolean,
  type: string,
  format: string,
  description: string,
): ParameterObject {
  return {
    name: name,
    description: description,
    in: location,
    required: required,
    schema: {
      type: type,
      format: format,
    },
  };
}

function buildRequestSchema(
  description: string,
  requiredProperties: string[],
  properties: object,
  example: object,
): object {
  return {
    description: description,
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: requiredProperties,
          properties: properties,
          example: example,
        },
      },
    },
  };
}

function buildResponseSchema(properties: object, example: object): object {
  return {
    schema: {
      type: 'object',
      properties: properties,
      example: example,
    },
  };
}

function buildCollectionResponseSchema(
  properties: object,
  example: object,
): object {
  return {
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: properties,
        example: example,
      },
    },
  };
}

export class AdcSchema {
  static adcId = buildParameterSchema(
    'id',
    'path',
    true,
    'string',
    '',
    'ADC resource ID',
  );

  static adcCreateRequest = buildRequestSchema(
    'ADC resource that need to be created',
    ['type', 'host'],
    adcCreateRequestProperties,
    adcCreateRequestExample,
  );

  static adcUpdateRequest = buildRequestSchema(
    'ADC resource properties that need to be updated',
    [],
    adcUpdateRequestProperties,
    adcUpdateRequestExample,
  );

  static adcResponse = buildResponseSchema(
    adcResponseProperties,
    adcResponseExample,
  );

  static adcCollectionResponse = buildCollectionResponseSchema(
    adcResponseProperties,
    adcResponseExample,
  );

  static BadRequest = ErrorResponseSchema.BadRequest().schema;

  static NotFound = ErrorResponseSchema.NotFound().schema;

  static UnprocessableEntity = ErrorResponseSchema.UnprocessableEntity().schema;
}
