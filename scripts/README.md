# Introduction to ADCaaS

ADCaaS is a multi-container Docker application that functions as the control plane for cloud-based ADC management and services deployment. 

Using  [docker-compose](https://docs.docker.com/compose/), you can rebuild/deploy an application to anywhere as a container cluster.

Before running an ADCaaS application, install [Docker](https://docs.docker.com/install/). 
ADCaas is not concerned with the OS type (Windows, Mac OS, Linux), hypervisor layer (KVM, VMware, Xen), and hardware architecture (x86_64, ARM); these are all handled by Docker runtime. 


## Containers

From the [``docker-compose.yml``](https://github.com/F5Networks/f5-adcaas-openstack/blob/master/deploy/docker-compose.yml), the ADCaaS runtime consists of the following containers:

- **WAFAAS**
  <br>
  The main application responsible for providing RESTful APIs for the following:

   - Provisioning ADC (BIG-IP VEs) on cloud platforms (**Note**: Currently only OpenStack)
   - Configuring LTM applications (Virtual Server in LTMs) piece-by-piece.
   - Assembling and deploying LTM applications configured as [AS3](https://clouddocs.f5.com/products/extensions/f5-appsvcs-extension/latest/)  declarations.
   - Uploading/enabling WAF policies on LTM applications.

- **ASG**
  <br>
  Application Service Gateway (ASG) provides some useful APIs for BIG-IP VE orchestration. It is extendable by installing iControlLx extensions. The following are the current extenstions in the ASG container:

  - [TrustedDevices](https://github.com/jgruber/TrustedDevices)
     <br>Trust BIG-IP VE in the declarative model; later access with no password.

  - [TrustedProxy](https://github.com/jgruber/TrustedProxy/)
    <br>Proxy iControl REST deployment requests to trusted devices.


  - [TrustedExtensions](https://github.com/jgruber/TrustedExtensions)
    <br>Publish iControlLX extensions to trusted devices (example: AS3 package).

  - [TrustedASMPolicies](https://github.com/jgruber/TrustedASMPolicies)
    <br>Export ASM policies from and import onto trusted devices.

  The ASG's ``/var/config`` folder is mounted as the volume for data persistence.

- **DO**
  <br>
  [Declarative Onboarding](https://github.com/F5Networks/f5-declarative-onboarding) (DO) uses a dedeclarative model to initially configure a BIG-IP device with all of the required settings to get it up and running, such as: hostname, license, modules, configsync, user, networks (interface/vLAN/IPs), DNS, and NTP.

- **PORTAL**
  <br>
  In addition to RESTful APIs, ADCaaS provides a portal for ADC management and application deployment.

  The portal is a [horizon](https://docs.openstack.org/horizon/latest/)-based web application running in cotainer.  

- **E / F /  K**
  <br>Refers to three different containers:
  - [Elasticsearch](https://www.elastic.co/)
  - [Fluentd](https://www.fluentd.org/)
  - [Kibana](https://www.elastic.co/products/kibana)

  From the ``docker-compose.yml``, other continers' logs are collected by the Fluentd logging driver and sent to a Fluentd container. By accessing Kibana, DevOps can do log agression or issue locating.

  Each API call can be traced by a unique request ID.

- **POSTGRES**
  <br>
  The database layer to store kinds of service model and management data. The database schema is auto-migrated at startup. In production, it is possible to switch to a own database of a customer.

## Container interactions 

The following chart shows the container interactions:


                                +------------+
                                |   PORTAL   |
                                +------------+
                                       |
                        +--------------+---------------+
                        |                              |
     +-------------------------------------+     +------------+
     |       LTMAAS/DNSAAS/..(future)      |     |   WAFAAS   |
     +-------------------------------------+     +------------+
                        |                              |
             +----------+-----+-------------+----------+------------+
             |                |             |          |            |
             |                |             |          |            |
       +---+---+---+   +------------+    +-----+   +------+         |
       | E | F | K |   |  POSTGRES  |    | ASG |   | (DO) |    [ OPENSTACK ]
       +---+---+---+   +------------+    +-----+   +------+     [ BIG-IQ ]
                                            |          |
                                            +-----+----+
                                                  |
                                             (BIG-IP VE)


**Notes**
- Rectangles are container instances. 
- `LTMAAS/DNSAAS/..(future)`: In the future, there may be more F5 *AAS functionalities.
- `(DO)` is now a container, but may be installed to a BIG-IP instance; thus, calls to DO change to BIG-IP.
- `(BIG-IP VE)` is the provisioned unit for declaration deployments. 
- `[ OPENSTACK ]`, `[ BIG-IQ ]` are ADCaaS dependencies. BIG-IQ is the license manager. OpenStack is the cloud platform to provision BIG-IP VE.

## Environment variable setttings
The configuration file for ADCaaS application is [`appcluster.rc`](https://github.com/F5Networks/f5-adcaas-openstack/blob/master/deploy/appcluster.rc). The following details the way the variables are categorized: 

- WAFaaS configuration: 
  
  `WAF_APP_PORT`: The port WAFaas listens on. Default: `3000`, http, or https.
  
  `WAF_APP_HOST`: Default: `0.0.0.0`.
  
  `WAF_CERT_KEY`: Key file when using https. Default: `/var/data/certs/domain.key`.
  
  `WAF_CERT_CRT`: Cert file when using https. Default: `/var/data/certs/domain.crt`.
  
  `WAF_ENABLE_HTTPS`: Whether to use https. Default: `false`.

- Postgres configuration: 

  `DATABASE_USER`: Database username. Default: `postgres`.
  
  `DATABASE_PASSWORD`: Database password. Default: `postgres`.
  
  `DATABASE_DB`: Database name. Default: `postgres`.
  
  `DATABASE_PORT`: database server port, default: `5432`.
  
  `DATABASE_HOST`: database host name. Default: `postgres-server`. 
  <br>In a Docker container cluster, the postgres-server is the linked name, which is recognized by other containers. You need to customize to other values when using different database instances (i.e. databases in the AWS cloud).
- OpenStack configuration: 
  
  `OS_AUTH_URL`: OpenStack keystone auth URL. Format: `http://<hostname>:<port>/<version>`. For example: `http://10.250.11.184:5000/v3`.
  
  `OS_USERNAME`: OpenStack service tenant admin username. ADCaaS needs a user with the role of service tenant admin to do some queries over multi-tenants. This user is usually created in keystone dedicated for an ADCaaS application. 
  
  `OS_PASSWORD`: OpenStack service tenant admin's password.
  
  `OS_TENANT_ID`: OpenStack service tenant ID. 
  
  `OS_FLOATINGIP_NETWORK_ID`: OpenStack floating IP network ID, for example: `a33f84be-e058-482b-9efd-5cef248a6ca4`.
  
  `OS_DOMAIN_NAME`: Required if identity version is v3, default value: `Default`.
  
  `OS_REGION_NAME`: Required if region name is not default `RegionOne`.
  
  `OS_INTERFACE`: OpenStack endpoint type, default: `public`.
  
  `OS_AVAILABLE_ZONE`: Possible useful variable, default: `nova`.

- Onboarding configuration:

  `DO_ENDPOINT`: DO endpoint. Default: `https://do-server:443`. 
  <br>`do-server` is a link address in docker-compose. Within docker-compose, the DO process listens on `443`.
  
  `DO_BIGIQ_HOST`: BIG-IQ address. For example: `10.250.11.138`.
  
  `DO_BIGIQ_USERNAME`: The BIG-IQ username. BIG-IQ is used as a license manager.
  
  `DO_BIGIQ_PASSWORD`: The BIG-IQ password.
  
  `DO_BIGIQ_POOL`: The license pool name on BIG-IQ. 
  
  `DO_RPM_PACKAGE`: DO RPM package. In order to reduce the workload of onboarding, install the DO functionalities to BIG-IP. Default value: `/var/dependencies/f5-declarative-onboarding-1.5.0-11.noarch.rpm`.
  
  `AS3_RPM_URL`: AS3 RPM package to install to BIG-IP VE. Default value: `file:///var/dependencies/f5-appsvcs-3.10.0-5.noarch.rpm`.
  
  `VE_DNS_SERVERS`: Onboarding VE parameters. Use a comma to seperate. For example, `8.8.8.8,7.7.7.7`. Default: `8.8.8.8`.
  
  `VE_DNS_SEARCH`: Onboarding VE parameters. For example, `openstack.local1,openstack.local2`, Default: `openstack.local`.
  
  `VE_NTP_SERVERS`: Onboarding VE parameters. Default: `0.pool.ntp.org,1.pool.ntp.org`.
  
  `VE_NTP_TIMEZONE`: Onboarding VE parameters. Default: `UTC`.
  
  `VE_LTM_LEVEL`: Onboarding VE parameters. There are four values for the LTM and ASM provision levels: ``dedicated`` | ``nominal`` | ``minimum`` | ``none``. Default: `nominal`.
  
  `VE_ASM_LEVEL`: Nominal.

- ASG configuration:

  `ASG_HOST`: ASG hostname. Default: `asg-server`. It is a linked name in docker-compose.
  
  `ASG_PORT`: ASG port. Default: `443`. Within docker-compose, the ASG process listens on `443`.

