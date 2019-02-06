// start a local rest server
import express = require('express');
import {Server} from 'http';
import {testrest_config as as3Endpoints} from '../fixtures/datasources/testrest.as3.datasource';
let server: Server;

export function setupRestServer(port: number) {
  // Our Express APP config
  const app = express();
  app.set('port', port);

  registerEndpoints(app);

  server = app.listen(app.get('port'), () => {});
}

export function teardownRestServer() {
  server.close();
}

const registeredList = [as3Endpoints];

function registerEndpoints(app: express.Application) {
  // API Endpoints
  app.get('/', (req, res) => {
    res.send('Hi');
  });

  registeredList.forEach(eps => {
    eps.operations.forEach(element => {
      let method = element.test.request.method.toLowerCase();
      let path = element.test.request.path;
      let statusCode = element.test.response.statusCode;
      let resBody = element.test.response.body;

      // TODO: use reflection to replace switch
      //let action = <IRouterMatcher<express.Application>>app[method];
      //action(path, (req, res) => {

      switch (method) {
        case 'get':
          app.get(path, (req, res) => {
            res.statusCode = statusCode;
            res.send(resBody);
          });
          break;
        case 'post':
          app.post(path, (req, res) => {
            res.statusCode = statusCode;
            res.send(resBody);
          });
          break;
        case 'delete':
          app.delete(path, (req, res) => {
            res.statusCode = statusCode;
            res.send(resBody);
          });
          break;
        case 'put':
          app.put(path, (req, res) => {
            res.statusCode = statusCode;
            res.send(resBody);
          });
          break;
        case 'patch':
          app.patch(path, (req, res) => {
            res.statusCode = statusCode;
            res.send(resBody);
          });
          break;
        default:
          throw Error('Not supported method: ' + method);
      }
    });
  });
}
