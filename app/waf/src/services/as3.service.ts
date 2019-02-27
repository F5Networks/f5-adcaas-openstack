import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {AS3DataSource} from '../datasources';

export interface AS3Service {
  // this is where you define the Node.js methods that will be
  // mapped to the SOAP operations as stated in the datasource
  // json file.
  info(host: string, port: number): Promise<string>;
  deploy(host: string, port:number, body: Object): Promise<string>;
}

export class AS3ServiceProvider implements Provider<AS3Service> {
  constructor(
    // AS3 must match the name property in the datasource json file
    @inject('datasources.AS3')
    protected dataSource: AS3DataSource = new AS3DataSource(),
  ) {}

  value(): Promise<AS3Service> {
    return getService(this.dataSource);
  }
}
