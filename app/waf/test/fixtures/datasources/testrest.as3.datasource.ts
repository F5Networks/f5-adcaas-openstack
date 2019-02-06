import {juggler} from '@loopback/repository';

export const testrest_config = {
  connector: 'rest',
  options: {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    strictSSL: false,
  },
  operations: [
    {
      template: {
        method: 'GET',
        url: 'http://{host}:{port}/mgmt/shared/appsvcs/info', // https -> http
      },
      functions: {
        info: ['host', 'port'],
      },
      test: {
        request: {
          path: '/mgmt/shared/appsvcs/info',
          headers: {},
          method: 'GET',
          // other
        },
        response: {
          body: {
            version: '3.7.0',
            release: '7',
            schemaCurrent: '3.7.0',
            schemaMinimum: '3.0.0',
          },
          statusCode: 200,
        },
      },
    },
  ],
};

export const testrest: juggler.DataSource = new juggler.DataSource(
  testrest_config,
);
