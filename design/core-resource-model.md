# F5 ADCaaS for OpenStack Core Resource Model

## Introduction

The present document intends to describe resource models of F5 ADCaaS for OpenStack, which represent the resources that may be requested via REST API.

The following diagram illustrates core resource models:


```
                                        +-------------+
                                +-------|     ADC     |
                                |       +-------------+
                                |              | m
                                |              |
                                |              | n
                                |       +-------------+
                                |       |   Tenant    |
                                |       +-------------+
                                |              | 1
                                |              |
                                |              | n
                                |       +-------------+ 1   n +-----------------+
                                +-------| Application |-------| AS3 Declaration |
                                        +-------------+       +-----------------+
                                               | 1
                                               |
                                               | n
                                        +-------------+ m
                       +----------------|   Service   |----------------+
                       |                +-------------+                |
                       |                                               |
                       |                                               | n
                1 +-------------+ m                             +-------------+
           +------|    Pool     |------+                        |   Policy    |
           |      +-------------+      |                        +-------------+
           |                           |                               | 1
           |                           |                               |
         n |                           | n                             | n
    +-------------+ m         n +-------------+               1 +-------------+ 1
    |    Member   |-------------|   Monitor   |          +------|    Rule     |------+
    +-------------+             +-------------+          |      +-------------+      |
                                                         |                           |
                                                         |                           |
                                                       n |                           | n
                                                  +-------------+             +-------------+
                                                  |  Condiftion |             |   Action    |
                                                  +-------------+             +-------------+
                                                                                     |
                                                                                     |
                                                                                     |
                                                                              +-------------+
                                                                              |  WAF Policy |
                                                                              +-------------+
```

## Resource Models

### ADC

An ADC (Application Delivery Controller) represents a specific type of hardware or sofware instance, such as F5 BIG-IP, which can help to perform common web tasks, including load balancing, SSL offloading, web application firewall and etc., for web applicaitons, in order to remove the load from web servers.

**Resource URI Path**

/adcaas/v1/adcs

**Resource Properties**

| Property   | Description |
| ---------- | ----------- |
| id         | ADC ID      |
| tenantId   | Tenant ID   |
| name       | Name        |
| type       | HW or VE    |
| host       | Hostname    |
| port       | Port        |
| username   | TODO:       |
| passphrase | TODO:       |

### ADC Group

TBD

### Tenant

A tenant is a group of users who share a common access with specific privileges to the cloud resources. F5 ADCaaS for OpenStack does not manage tenant resource. It consumes the tenant resource infomation from OpenStack. A tenant resource relates to a collection of F5 ADCaaS Application resources.

### Application

An application represents a collection of ADC resources related to a software instance running in the cloud.

**Resource URI Path**

/adcaas/v1/application

**Resource Properties**

| Property        | Description                                      |
| --------------- | ------------------------------------------------ |
| id              | Application ID                                   |
| name            | Name                                             |
| tenantId        | Tenant ID                                        |
| services        | Service IDs                                      |
| as3DelarationId | The current AS3 declaration for this Application |
| adcId           | ID of preferred ADC to deploy AS3 declaration    |

### Application Configuration

Application Configuration is a set of concrete configuration data which can instruct ADC to perfrom common web tasks for an Application. F5 ADCaaS selects F5 AS3 as the management technology for F5 BIG-IP. In this case, the Application Configuration is AS3 JSON declaration data.

Application Configuration is generated by ADCaaS system from all related ADCaaS resources of an Application. Cloud user is allowed to request the system to re-generate the configuration data, after modifying related resources. And cloud user is also allowed to request the system to deploy the configuration data to ADC instance at any time.

**Resource URI Path**

/adcaas/v1/application/{id}/as3configs

**Resource Properties**

| Property       | Description    |
| -------------- | -------------- |
| id             | ID             |
| tenantId       | Tenant ID      |
| applicationId  | Application ID |
| TBD:           | Others         |

### Association with ADC

In a multitenancy cloud, the visibility and ownership of ADC hardware/software instances need to be managed by cloud platform. Two types of association resource is provided to implement that:

**Tenant Association with ADC**

An ADC hardware instance is usually operated by cloud platform. The cloud admin or ADC owner can define the visiblity of an ADC hardware instance, in order to allow specific groups of cloud users to utilize that ADC hardware. The cloud admin can also define a 'default' ADC hardware for all cloud tenants who don't have a specific list of visible ADCs.

An ADC software instance natually has the association to the tenant in which its resides. The cloud platform can automatically create association resource between Tenant resource and software ADC resource. That software ADC instance is visible to all cloud users of that tenant. Cloud admin or the owner of ADC software instance is permitted to share ADC software instance with other tenants. They may create the association between software ADC with tenants, as they do for hardware ADC.

A tenant may have multiple visible ADCs, including hardware and software ADC instances. Only one of them can be the default ADC instance, if the application does not specify an ADC as its target.

**Resource URI Path**

/adcaas/v1/tenants/{id}/adcs

**Resource Properties**

| Property  | Description |
| --------- | ----------- |
| tenantId  | Tenant ID   |
| adcId     | ADC ID      |

**Application Association with ADC**

If the application configuration need to be deployed to a specific ADC hardware or software instance, cloud user can specify the preferred ADC id for the Application resource.

### Service

An Application may expose various types of services to end users. From the perspective of application delivery controller, those services can be categorized into several fixed types according to network transportation protocol, and a Service resource represents the endpoint to access those services provided by Application.

**Resource URI Path**

/adcaas/v1/services

**Resource Properties**

| Property         | Description       |
| ---------------- | ----------------- |
| id               | Service ID        |
| tenantId         | Tenant ID         |
| applicationId    | Application ID    |
| type             | Protocol type     |
| virtualAddresses | Virtual addresses |
| virtualPort      | Virtual port      |
| defaultPooId     | Default pool ID   |

### Pool

A Pool is a collection of back-end destinations to distribute inbound application traffic. A Service must have one default Pool at least, but the traffic of a Service may be distributed to different Pools due to specific conditions.

**Resource URI Path**

/adcaas/v1/pools

**Resource Properties**

| Property  | Description     |
| --------- | --------------- |
| id        | Pool ID         |
| tenantId  | Tenant ID       |
| members   | Pool member IDs |
| monitors  | Monitor IDs     |

### Pool Member

A Pool Member represents one back-end destination in a Pool to consume the inbound application traffic.

**Resource URI Path**

/adcaas/v1/pools/{id}/members

**Resource Properties**

| Property  | Description |
| --------- | ----------- |
| id        | Pool ID     |
| tenantId  | Tenant ID   |
| addresses | Addresses   |
| port      | Port        |
| monitors  | Monitor IDs |

### Monitor

**Resource URI Path**

/adcaas/v1/monitors

**Resource Properties**

| Property  | Description  |
| --------- | ------------ |
| id        | Monitor ID   |
| tenantId  | Tenant ID    |
| type      | Monitor type |

### Policy

Policy is a collection of ADC Rules, that can be applied to an Application.

**Resource URI Path**

/adcaas/v1/monitors

**Resource Properties**

| Property  | Description  |
| --------- | ------------ |
| id        | Monitor ID   |
| tenantId  | Tenant ID    |
| rules     | Rule IDs     |

### Rule

Rule is a combination of a set of conditions, which can be utilized by ADC to evaluate the incoming traffic, and a set of actions, which can be performed by ADC to handle the incoming traffic. Condition and action are not individual resources. They must be defined in a specific Rule.

**Resource URI Path**

/adcaas/v1/rules

**Resource Properties**

| Property   | Description  |
| ---------- | ------------ |
| id         | Monitor ID   |
| tenantId   | Tenant ID    |
| conditions | Conditions   |
| actions    | Actions      |

### WAFPolicy

WAFPolicy represents an entity of WAF action definition, which is usually a configuration file for WAF module of ADC.

**Resource URI Path**

/adcaas/v1/wafpolicy

**Resource Properties**

| Property  | Description  |
| --------- | ------------ |
| id        | Monitor ID   |
| tenantId  | Tenant ID    |

## Summary

TBD

## Reference

[https://clouddocs.f5.com/products/extensions/f5-appsvcs-extension/latest/userguide/](https://clouddocs.f5.com/products/extensions/f5-appsvcs-extension/latest/userguide/)

[https://developer.openstack.org/api-ref/load-balancer/v2/](https://developer.openstack.org/api-ref/load-balancer/v2/)

[https://wiki.openstack.org/wiki/Neutron/LBaaS](https://wiki.openstack.org/wiki/Neutron/LBaaS)
