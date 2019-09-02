ADCaaS Delivery Mode
====================

ADCaaS is a multi-container Docker application that functions as the control plane for cloud-based ADC management and services deployment. 

Using  `docker-compose <https://docs.docker.com/compose/>`_, you can rebuild/deploy an application to anywhere as a container cluster.

Before running an ADCaaS application, install `Docker <https://docs.docker.com/install/>`_.
ADCaas is not concerned with the OS type (Windows, Mac OS, Linux), hypervisor layer (KVM, VMware, Xen), and hardware architecture (x86_64, ARM); these are all handled by Docker runtime. 


Containers
----------

From the `docker-compose.yml <https://github.com/F5Networks/f5-adcaas-openstack/blob/master/deploy/docker-compose.yml>`_, the ADCaaS runtime consists of the following containers:

* **ADCAAS**
  
  The main application responsible for providing RESTful APIs for the following:
  
  - Provisioning ADC (BIG-IP VEs) on cloud platforms (**Note**: Currently only OpenStack)
  - Configuring LTM applications (Virtual Server in LTMs) piece-by-piece.

  - Assembling and deploying LTM applications configured as `AS3 <https://clouddocs.f5.com/products/extensions/f5-appsvcs-extension/latest/>`_ declarations.

  - Uploading/enabling WAF policies on LTM applications.
   

* **ASG**

  Application Service Gateway (ASG) provides some useful APIs for BIG-IP VE orchestration. It is extendable by installing iControlLx extensions. The following are the current extenstions in the ASG container:

  - `TrustedDevices <https://github.com/jgruber/TrustedDevices>`_: Trust BIG-IP VE in the declarative model; later access with no password.

  - `TrustedProxy <https://github.com/jgruber/TrustedProxy/>`_: Proxy iControl REST deployment requests to trusted devices.

  - `TrustedExtensions <https://github.com/jgruber/TrustedExtensions>`_: Publish iControlLX extensions to trusted devices (example: AS3 package).

  - `TrustedASMPolicies <https://github.com/jgruber/TrustedASMPolicies>`_: Export ASM policies from and import onto trusted devices.

  The ASG's ``/var/config`` folder is mounted as the volume for data persistence.

* **DO**
  
  `Declarative Onboarding <https://github.com/F5Networks/f5-declarative-onboarding>`_ (DO) uses a dedeclarative model to initially configure a BIG-IP device with all of the required settings to get it up and running, such as: hostname, license, modules, configsync, user, networks (interface/vLAN/IPs), DNS, and NTP.

* **PORTAL**
  
  In addition to RESTful APIs, ADCaaS provides a portal for ADC management and application deployment.

  The portal is a `horizon <https://docs.openstack.org/horizon/latest/>`_-based web application running in cotainer.

* **E / F /  K**
  
  Refers to three different containers:

  - `Elasticsearch <https://www.elastic.co/>`_

  - `Fluentd <https://www.fluentd.org/>`_

  - `Kibana <https://www.elastic.co/products/kibana>`_

  From the ``docker-compose.yml``, other continers' logs are collected by the Fluentd logging driver and sent to a Fluentd container. By accessing Kibana, DevOps can do log agression or issue locating.

  Each API call can be traced by a unique request ID.

* **POSTGRES**

  The database layer to store kinds of service model and management data. The database schema is auto-migrated at startup. In production, it is possible to switch to a own database of a customer.

Container interactions 
----------------------

The following chart shows the container interactions:

::

                                +------------+
                                |   PORTAL   |
                                +------------+
                                       |
                        +--------------+---------------+
                        |                              |
     +-------------------------------------+     +------------+
     |     LTMAAS/DNSAAS/..(In future)     |     |   WAFAAS   |
     +-------------------------------------+     +------------+
                        |                              |
             +----------+-----+-------------+----------+------------+
             |                |             |          |            |
             |                |             |          |            |
       +---+---+---+   +------------+    +-----+   +------+         |
       | E | F | K |   |  POSTGRES  |    | ASG |   | (DO) |         |
       +---+---+---+   +------------+    +-----+   +------+         |
                                            |          |            |
                                            +-----+----+            |
                                                  |            [ OPENSTACK ]
                                             (BIG-IP VE)        [ BIG-IQ ]


**Notes**

- Rectangles are container instances.

- `LTMAAS/DNSAAS/..(future)`: In the future, there may be more F5 \*AAS functionalities.

- `(DO)` is now a container, but may be installed to a BIG-IP instance; thus, calls to DO change to BIG-IP.

- `(BIG-IP VE)` is the provisioned unit for declaration deployments.

- `[ OPENSTACK ]`, `[ BIG-IQ ]` are ADCaaS dependencies. BIG-IQ is the license manager. OpenStack is the cloud platform to provision BIG-IP VE.

