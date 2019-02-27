import {Adc, Application, Service, Pool, Wafpolicy, Endpointpolicy,Rule} from '.';

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
    //this.targetPort = adc.port;
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

    this.class = 'ADC';
    this.schemaVersion = '3.8.0';
    this.id = 'tbd';
    this.tenants = [];
    this.tenants.push(new AS3Tenant(params));
  }

  toJSON(): Object {
    let obj: AS3JSONObject = {
      class: this.class,
      schemaVersion: this.schemaVersion,
      id: this.id,
      label: 'ADCaaS',
    };
    for (let tenant of this.tenants) {
      obj[tenant.name] = tenant;
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
      obj[app.name] = app;
    } 
    return obj;
  }
}

export class AS3Application extends AS3Object {
  name: string;
  template: string;
  serviceMain: AS3ServiceHTTP;
  endpointpolicyObj:AS3EndpointPolicy;
  wafs: AS3WAFPolicy[];	
  pool: AS3Pool;

  constructor(params: {[key: string]: Object}) {
    super();
    let app = <Application>params['application'];
    let service = <Application>params.service;
    let endpointpolicy = <Endpointpolicy>params['endpointpolicy'];	 
    let wafs = <Wafpolicy[]>params.wafs;

    this.class = 'Application';
    this.name = app.name;
    this.template = 'http';

    if (service) {
      this.serviceMain = new AS3ServiceHTTP(params);
    }
    if (endpointpolicy) {
      this.endpointpolicyObj = new AS3EndpointPolicy(params); 
    }
    this.wafs = [];
    if (wafs) {
       for (let wafpolicy of wafs) {
    	  this.wafs.push(new AS3WAFPolicy(wafpolicy));
      } 
    }
    this.pool = new AS3Pool();
  }

  toJSON(): Object {
    let obj: AS3JSONObject = {
      class: this.class,
      template: this.template,
    };
 
    if (this.serviceMain) {
      obj.serviceMain = this.serviceMain;

      if (this.serviceMain.pool) {
        obj[this.serviceMain.pool.name] = this.serviceMain.pool;
      }

      if (this.serviceMain.policyWAF) {
        obj[this.serviceMain.policyWAF.name] = this.serviceMain.policyWAF;
      }
    }
    obj['webpool'] = this.pool;
    if (this.endpointpolicyObj) {
    	obj[this.endpointpolicyObj.name] = this.endpointpolicyObj;
    }
    
    for (let waf of this.wafs) {
      obj[waf.name] = waf;
    }    
    
    return obj;
  }
}

export class AS3ServiceHTTP extends AS3Object {
  name: string;
  virtualAddresses: string[];
  pool: AS3Pool;
  policyWAF: AS3WAFPolicy;
  policyEndpoint: string;

  constructor(params: {[key: string]: Object}) {
    super();
    let service = <Service>params['service'];
    let waf = <Wafpolicy>params['waf'];
    let endpointpolicy = <Endpointpolicy>params['endpointpolicy'];	 
    this.class = 'Service_HTTP';
    this.virtualAddresses = service.virtualAddresses;

    if (service.pool) {
      this.pool = new AS3Pool();
    }

    if (waf) {
      this.policyWAF = new AS3WAFPolicy(waf);
    }
    
    if (endpointpolicy) {
      this.policyEndpoint = endpointpolicy.name;
    }
  }

  toJSON(): Object {
    let obj: AS3JSONObject = {
      class: this.class,
      pool: 'webpool',
      virtualAddresses: this.virtualAddresses,
    };

    if (this.pool) {
      obj.pool = this.pool.name;
    }

    //if (this.policyWAF) {
    //	obj.policyWAF = this.policyWAF;
    //  }
    
    if (this.policyEndpoint) {
       obj.policyEndpoint = this.policyEndpoint;
    }

    return obj;
  }
}
export class AS3Path extends AS3Object {
    operand:string;
    values:string[];
    keyword:string;
    constructor(pattern:string) {
    	super();
	this.operand="contains";
	this.values = [pattern];
     } 
     toJSON():Object {
         let obj: AS3JSONObject = {
	     operand:this.operand,
             values:this.values,	     
	 }
	 return obj;
     }
}
export class AS3Condition extends AS3Object {
   type:string;
   path:AS3Path;

   constructor(pattern: string) {
    super();
    this.type = "httpUri";
    this.path = new  AS3Path(pattern);
   }

   toJSON(): Object {
      let obj: AS3JSONObject = {
        type:this.type, 
        path:this.path,
      };
      return obj;
   }

}
export class AS3Policy extends AS3Object {
   policyname:string;
   use:string;
   constructor(name: string) {
     super();
     this.policyname=name;
   }   
   toJSON(): Object {
      let obj: AS3JSONObject = {
      use:this.policyname,
     };
   return obj;
   }
}
export class AS3Action extends AS3Object {
   type:string;
   policy:AS3Policy;
   constructor(name: string) {
    super();
    this.type = "waf";
    if (name != "") {
    this.policy = new AS3Policy(name);
    }
   } 

   toJSON(): Object {
      let obj: AS3JSONObject = {
        type:this.type, 
	      policy:this.policy,
      };
      return obj;
   }

}
export class AS3Rule extends AS3Object {
  name: string;
  conditions:AS3Condition[];
  actions:AS3Action[];
  defaultrule:boolean;
  policyname: string;
  constructor(rule: Rule,params: {[key: string]: Object} ) {
    super();
    this.name = rule.name;
    this.conditions = [];
    this.defaultrule = rule.default;
    this.actions = [];
    this.policyname = "";
    if (this.defaultrule == false) {
    	let pattern = rule.pattern;
    	//condition means the matching pattern
	    this.conditions.push(new AS3Condition(pattern));
     }
     let wafpolicy = rule.wafpolicy;
     let wafs = <Wafpolicy[]>params.wafs;
	    
     //action means the waf policy name	    
     for (let waf of wafs) {
     	if (waf.id == wafpolicy) {
           this.policyname = waf.name;
           break;
         }
     }
     this.actions.push(new AS3Action(this.policyname));
 
   }

  toJSON(): Object {
    let obj: AS3JSONObject = {
       name: this.name,
       conditions:this.conditions,
       actions:this.actions,
     };
     return obj;
  }
}
export class AS3EndpointPolicy extends AS3Object {
  name: string;
  rules: AS3Rule[];
  constructor(params: {[key: string]: Object}) {
    super();
    let endpointpolicy = <Endpointpolicy>params['endpointpolicy'];
    let rules = <Rule[]>params.rules;	    
    this.class = 'Endpoint_Policy';
    this.name = endpointpolicy.name;
    this.rules = []; 
    //Make sure the default rule is located at the end of the list
    let defaultrulenum = 0;
    for (let rule of rules) {
        if (rule.default == false){
	        this.rules.push(new AS3Rule(rule,params));
	      } else {
	        defaultrulenum ++;
	      }
    }
     //TODO Do not allow more than one default rule.
    for (let rule of rules) {
        if (rule.default == true){
	      this.rules.push(new AS3Rule(rule,params));
        } 
    }
  }   
  toJSON(): Object {
    let obj: AS3JSONObject = {
      class: this.class,
      rules: this.rules,
    };
    return obj;
  }
}
export class AS3Pool extends AS3Object {
  name: string;
  monitors: string[];
  members: AS3PoolMember[];

  constructor() {
    super();

    this.class = 'Pool';
    this.monitors = ['http'];

    this.name = 'webpool';
    this.members = [];
    this.members.push(new AS3PoolMember('10.128.10.145'))
    //let members = <Member>params['members'];

    //this.members = [];
    //for (let member of members) {
    //  this.members.push(new AS3PoolMember(member));
    //}
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

  constructor(member: string) {
    super();
    this.servicePort = 80;
    this.serverAddresses = [member];
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
