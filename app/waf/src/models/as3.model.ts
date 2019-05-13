import {Adc, Application, Declaration} from '.';

export class AS3Declaration {
  [key: string]: undefined | string | number | boolean | object;
}

export function as3Name(id: string) {
  return 'F5_' + id.replace(/-/g, '_');
}

export class AS3DeployRequest {
  readonly class: string = 'AS3';
  readonly action: 'deploy';
  targetHost: string;
  targetPort: number;
  targetUsername: string;
  targetPassphrase: string;
  declaration: AS3Declaration;

  constructor(adc: Adc, application: Application, declaration?: Declaration) {
    this.targetHost = adc.management!.ipAddress;
    this.targetPort = adc.management!.tcpPort;
    //TODO: remove admin/pass after implement trusted connection
    this.targetUsername = 'admin';
    this.targetPassphrase = 'admin';
    this.declaration = {
      class: 'ADC',
      schemaVersion: '3.0.0',
      id: adc.id,
    };

    let tenant = as3Name(application.tenantId);
    this.declaration[tenant] = {
      class: 'Tenant',
      label: application.tenantId,
    };

    if (declaration) {
      Object.assign(this.declaration[tenant], {
        [application.getAS3Name()]: declaration.content,
      });
    }
  }
}
