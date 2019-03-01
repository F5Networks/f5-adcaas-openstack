import {Adc, Application, Service, Pool, Member, Wafpolicy} from '.';

export class AS3Object extends Object {
  class: string;

  constructor() {
    super();
  }
}

export class AS3Pointer extends Object {
  use: string;

  constructor(name: string) {
    super();

    this.use = name;
  }
}

export class AS3JSONObject extends Object {
  [key: string]: Object;
}

export class AS3DeployRequest extends AS3Object {
  action: string;
  targetHost: string;
  targetPort: number;
  targetUsername: string;
  targetPassphrase: string;
  declaration: AS3Declaration;

  constructor(params: {[key: string]: Object}) {
    super();

    let adc = <Adc>params['adc'];

    this.class = 'AS3';
    this.action = 'deploy';
    this.targetHost = adc.host;
    this.targetPort = adc.port;
    this.targetUsername = adc.username;
    this.targetPassphrase = adc.passphrase;
    this.declaration = new AS3Declaration(params);
  }
}

export class AS3Declaration extends AS3Object {
  schemaVersion: string;
  id: string;
  tenants: AS3Tenant[];

  constructor(params: {[key: string]: Object}) {
    super();

    let adc = <Adc>params.adc;

    this.class = 'ADC';
    this.schemaVersion = '3.0.0';
    this.id = adc.id;
    this.tenants = [];
    this.tenants.push(new AS3Tenant(params));
  }

  toJSON(): Object {
    let obj: AS3JSONObject = {
      class: this.class,
      schemaVersion: this.schemaVersion,
      id: this.id,
    };
    for (let tenant of this.tenants) {
      obj[tenant.name] = tenant.toJSON();
    }
    return obj;
  }
}

export class AS3Tenant extends AS3Object {
  name: string;
  applications: AS3Application[];

  constructor(params: {[key: string]: Object}) {
    super();

    let app = <Application>params.application;

    this.class = 'Tenant';
    this.name = 'Tenant_' + app.tenantId;

    this.applications = [];
    this.applications.push(new AS3Application(params));
  }

  toJSON(): Object {
    let obj: AS3JSONObject = {
      class: this.class,
    };
    for (let app of this.applications) {
      obj[app.name] = app.toJSON();
    }
    return obj;
  }
}

export class AS3Application extends AS3Object {
  name: string;
  template: string;
  serviceMain: AS3ServiceHTTP;

  constructor(params: {[key: string]: Object}) {
    super();

    let app = <Application>params.application;
    let service = <Application>params.service;

    this.class = 'Application';
    this.name = app.name;
    this.template = 'http';

    if (service) {
      this.serviceMain = new AS3ServiceHTTP(params);
    }
  }

  toJSON(): Object {
    let obj: AS3JSONObject = {
      class: this.class,
      template: this.template,
    };

    if (this.serviceMain) {
      obj.serviceMain = this.serviceMain.toJSON();

      if (this.serviceMain.pool) {
        obj[this.serviceMain.pool.name] = this.serviceMain.pool.toJSON();
      }
    }
    return obj;
  }
}

export class AS3ServiceHTTP extends AS3Object {
  name: string;
  virtualAddresses: string[];
  pool: AS3Pool;

  constructor(params: {[key: string]: Object}) {
    super();

    let service = <Service>params['service'];
    this.class = 'Service_HTTP';
    this.virtualAddresses = service.virtualAddresses;

    if (service.pool) {
      this.pool = new AS3Pool(params);
    }
  }

  toJSON(): Object {
    let obj: AS3JSONObject = {
      class: this.class,
      virtualAddresses: this.virtualAddresses,
    };

    if (this.pool) {
      obj.pool = this.pool.name;
    }

    return obj;
  }
}

export class AS3Pool extends AS3Object {
  name: string;
  monitors: string[];
  members: AS3PoolMember[];

  constructor(params: {[key: string]: Object}) {
    super();

    this.class = 'Pool';
    this.monitors = ['http'];

    let pool = <Pool>params.pool;
    if (pool.name) {
      this.name = pool.name;
    }

    let members = <Member[]>params.members;

    this.members = [];
    for (let member of members) {
      this.members.push(new AS3PoolMember(member));
    }
  }

  toJSON(): Object {
    let obj: AS3JSONObject = {
      class: this.class,
      monitors: this.monitors,
      members: this.members,
    };
    return obj;
  }
}

export class AS3PoolMember extends Object {
  servicePort: number;
  serverAddresses: string[];

  constructor(member: Member) {
    super();

    this.servicePort = member.port;
    this.serverAddresses = [member.address];
  }
}

export class AS3WAFPolicy extends AS3Object {
  name: string;
  url: string;

  constructor(policy: Wafpolicy) {
    super();

    this.class = 'WAF_Policy';
    this.name = policy.name;
    this.url = policy.url;
  }

  toJSON(): Object {
    let obj: AS3JSONObject = {
      class: this.class,
      url: this.url,
    };
    return obj;
  }
}
