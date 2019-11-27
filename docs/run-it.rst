Getting Started
======================================

To get started with ADCaaS, we'll need to get it on your system. This section will go over installing ADCaaS on your system.

**Download ADCaaS**
--------------------

Generally, there are two alternative ways to download the ADCaaS application. 

The first way is dowloading the released version, which is recommended and will be delivered soon. You can go to `ADCaaS docker image set [Coming] <https://github.com/F5Networks/f5-adcaas-openstack/releases>`_ and choose the installation package of tar.gz or rpm to download.

-  For .tar.gz: unzip the file via ``tar zxf <file.tar.gz>``. Then you may find *start\_all.sh* under *dist/scripts/*, we call *dist* the ``localrepo`` in the following description.
-  For .rpm: run ``rpm -i <file.rpm>`` to install it. 

The second approach is to download the `ADCaaS Repository <https://github.com/F5Networks/f5-adcaas-openstack>`_ directly from the F5Networks github. You may use this way if you are planning on contributing or testing codes in the future. 
Basically, we are recommending you to follow the steps below to install ADCaaS locally. 

-  ``Fork`` the ADCaaS repository to your own repository. You may need to prepare a github account of your own here. 
-  ``Clone`` your own repository to local sandbox.
Now, you have successfully downloaded the ADCaaS package to your own system. 

**Environment Prerequisite and Configuration**
------------------------------------------------------------

Before running ADCaaS as a standalone application, we need to enable a few environment prerequisites.

1)  `OpenStack <https://github.com/F5Networks/f5-adcaas-openstack/blob/master/docs/openstack-prerequisites.rst>`_

-  In *<localrepo>/deploy/appcluster.rc*, update ``OS_*`` configuration according to your OpenStack environment. 

2)  `BIGIQ <https://support.f5.com/csp/knowledge-center/software/BIG-IQ?module=BIG-IQ%20Device>`_

-  Update the ``BIGIQ_*`` configuration in appcluster.rc accordingly.

3)  `Docker CE <https://docs.docker.com/install/>`_


4)  `npm <https://docs.npmjs.com/downloading-and-installing-node-js-and-npm>`__

-  Change the work directory to *<localrepo>/app/waf*, and run ``npm install`` command to install package dependencies.

You may be aware that other configuration variables may need to be customized on your requirements. For more details, see `Environment variable settings <configuration.html>`_ Page.

**Run ADCaaS as Standalone Application**
----------------------------------------

Use */scripts/start\_all.sh* to start ADCaaS.

Basically, the script will process steps below for us:

1) Download dependencies if not exists locally, including dependent rpm files and docker images.

2) Run the container initialization.

3) Enable environment settings depending on appcluster.rc settings.

4) Run ``docker-compose up -d -f <localrepo>/deploy/docker-compose.yml`` to start ADCAAS container and its dependent containers, see that *docker-compose.yml* file.

   Note: On MacOSX, running ``start_all.sh`` may get the error:

   ::

       ERROR: for ASG  Cannot start service ASG: Mounts denied:
              The path /var/tmp/ASGExtensions is not shared from OS X and is not known to Docker.       
                 You can configure shared paths from Docker -> Preferences... -> File Sharing.
                 See https://docs.docker.com/docker-for-mac/osxfs/#namespaces for more info.
            


   *Solution*: Add ``/var/tmp`` (better) or ``/var/tmp/ASGExtensions`` to the settings as it mentions.

**Check ADCaaS Running Status**
--------------------------------

1. Ater executing ``start_all.sh``, use ``docker ps`` to see the container
set.

::

    1fe367969441        f5devcentral/f5-openstack-services:portal-latest      "/bin/sh -c 'python …"   44 minutes ago      Up 44 minutes       0.0.0.0:8245->80/tcp                                                                     PORTAL
    ebd02566082f        f5devcentral/f5-openstack-services:adcaas-latest      "/bin/sh -c 'node in…"   44 minutes ago      Up 44 minutes       0.0.0.0:3000->3000/tcp                                                                   ADCAAS
    3b82a0771f03        f5devcentral/f5-api-services-gateway:1.0.12           "/etc/runit/boot"        44 minutes ago      Up 44 minutes       0.0.0.0:8080->80/tcp, 0.0.0.0:8443->443/tcp                                              ASG
    e1617238f75f        postgres:11.1                                         "docker-entrypoint.s…"   44 minutes ago      Up 44 minutes       0.0.0.0:5432->5432/tcp                                                                   POSTGRES
    8bcb68e54237        f5devcentral/f5-openstack-services:fluentd-v1.3.2     "/bin/entrypoint.sh …"   45 minutes ago      Up 44 minutes       0.0.0.0:20001->20001/udp, 5140/tcp, 0.0.0.0:24224->24224/udp, 0.0.0.0:24224->24224/tcp   FLUENTD
    04dfcc4fab4a        docker.elastic.co/kibana/kibana:7.2.0                 "/usr/local/bin/kiba…"   45 minutes ago      Up 45 minutes       0.0.0.0:5601->5601/tcp                                                                   KIBANA
    1376e898a717        docker.elastic.co/elasticsearch/elasticsearch:7.2.0   "/usr/local/bin/dock…"   45 minutes ago      Up 45 minutes       0.0.0.0:9200->9200/tcp, 9300/tcp                                                         ELASTICSEARCH

2. Run ``curl http://localhost:3000/ping`` to check if ADCaaS runs OK.
You may find the response below if ADCaaS operating well:

::

    {
        "greeting": "Hello from F5 ADCaaS for OpenStack",
        "date": "2019-11-05T08:47:23.276Z",
        "url": "/ping",
        "headers": {
            "content-type": "application/json",
            "user-agent": "PostmanRuntime/7.19.0",
            "accept": "*/*",
            "cache-control": "no-cache",
            "postman-token": "fb8463c6-2c71-4b44-85ac-e6233c2fbf09",
            "host": ":3000",
            "accept-encoding": "gzip, deflate",
            "connection": "keep-alive"
        }
    }

3. Thus we can use Postman(Swagger API definition:
https://f5networks.github.io/f5-adcaas-openstack/) or access PORTAL
(port:8245) to provision BIG-IP VE.
- The username and password for login is the same as your OpenStack.

The PORTAL(port:8245) is integrated with OpenStack platform(Keystone for auth*, neutron for VE network setup, nova for VM sources.), so if `appcluster.rc` is configured correctly, the provisioned BIG-IP VE can be managed/orchestrated within tenant.
