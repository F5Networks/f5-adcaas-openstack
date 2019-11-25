Environment variable settings
=============================

The configuration file for ADCaaS application is `appcluster.rc <https://github.com/F5Networks/f5-adcaas-openstack/blob/master/deploy/appcluster.rc>`_. The following details the way the variables are categorized:

* ADCaaS configuration:
  
  ``ADCAAS_APP_PORT``: The port ADCaaS listens on. Default: ``3000``, http, or https.
  
  ``ADCAAS_APP_HOST``: Default: ``0.0.0.0``.

  ``ADCAAS_APP_PROTOCOL``: Default: ``http``
  
  ``ADCAAS_CERT_KEY``: Key file when using https. Default: ``/var/data/certs/domain.key``.
  
  ``ADCAAS_CERT_CRT``: Cert file when using https. Default: ``/var/data/certs/domain.crt``.
  
  ``ADCAAS_ENABLE_HTTPS``: Whether to use https. Default: ``false``.

* Postgres configuration:

  ``DATABASE_USER``: Database username. Default: ``postgres``.
  
  ``DATABASE_PASSWORD``: Database password. Default: ``postgres``.
  
  ``DATABASE_DB``: Database name. Default: ``postgres``.
  
  ``DATABASE_PORT``: database server port, default: ``5432``.
  
  ``DATABASE_HOST``: database host name. Default: ``postgres-server``. In a Docker container cluster, the postgres-server is the linked name, which is recognized by other containers. You need to customize to other values when using different database instances (i.e. databases in the AWS cloud).

* OpenStack configuration:
  
  ``OS_AUTH_URL``: OpenStack keystone auth URL. Format: ``http://<hostname>:<port>/<version>``. For example: ``http://10.250.11.184:5000/v3``.
  
  ``OS_USERNAME``: OpenStack service tenant admin username. ADCaaS needs a user with the role of service tenant admin to do some queries over multi-tenants. This user is usually created in keystone dedicated for an ADCaaS application. 
  
  ``OS_PASSWORD``: OpenStack service tenant admin's password.
  
  ``OS_TENANT_ID``: OpenStack service tenant ID. 
  
  ``OS_FLOATINGIP_NETWORK_ID``: OpenStack floating IP network ID, for example: ``a33f84be-e058-482b-9efd-5cef248a6ca4``.
  
  ``OS_DOMAIN_NAME``: Required if identity version is v3, default value: ``Default``.
  
  ``OS_REGION_NAME``: Required if region name is not default ``RegionOne``.
  
  ``OS_INTERFACE``: OpenStack endpoint type, default: ``public``.
  
  ``OS_AVAILABLE_ZONE``: Possible useful variable, default: ``nova``.

* Onboarding configuration:

  ``DO_ENDPOINT``: DO endpoint. Default: ``https://do-server:443``. ``do-server`` is a link address in docker-compose. Within docker-compose, the DO process listens on ``443``.
  
  ``DO_BIGIQ_HOST``: BIG-IQ address. For example: ``10.250.11.138``.
  
  ``DO_BIGIQ_USERNAME``: The BIG-IQ username. BIG-IQ is used as a license manager.
  
  ``DO_BIGIQ_PASSWORD``: The BIG-IQ password.
  
  ``DO_BIGIQ_POOL``: The license pool name on BIG-IQ. 
  
  ``DO_RPM_PACKAGE``: DO RPM package. In order to reduce the workload of onboarding, install the DO functionalities to BIG-IP. Default value: ``/var/dependencies/f5-declarative-onboarding-1.5.0-11.noarch.rpm``.
  
  ``AS3_RPM_URL``: AS3 RPM package to install to BIG-IP VE. Default value: ``file:///var/dependencies/f5-appsvcs-3.10.0-5.noarch.rpm``.
  
  ``VE_DNS_SERVERS``: Onboarding VE parameters. Use a comma to seperate. For example, ``8.8.8.8,7.7.7.7``. Default: ``8.8.8.8``.
  
  ``VE_DNS_SEARCH``: Onboarding VE parameters. For example, ``openstack.local1,openstack.local2``, Default: ``openstack.local``.
  
  ``VE_NTP_SERVERS``: Onboarding VE parameters. Default: ``0.pool.ntp.org,1.pool.ntp.org``.
  
  ``VE_NTP_TIMEZONE``: Onboarding VE parameters. Default: ``UTC``.
  
  ``VE_LTM_LEVEL``: Onboarding VE parameters. Four values for the LTM and ASM provision levels: ``dedicated`` | ``nominal`` | ``minimum`` | ``none``. Default: `nominal`.
  
  ``VE_ASM_LEVEL``: Nominal.

* ASG configuration:

  ``ASG_HOST``: ASG hostname. Default: ``asg-server``. It is a linked name in docker-compose.
  
  ``ASG_PORT``: ASG port. Default: ``443``. Within docker-compose, the ASG process listens on ``443``.
