Run ADCaaS as a Standalone Application
======================================

ADCaaS is released as a docker image set which customers can pull from
the docker repository and run locally via docker-compose.

The docker repository can be owed by either customers themselves or
F5Networks.

To run the application, Let's start from the dist folder. The folder can
be delevered as .tar.gz or .rpm.

-  for .tar.gz: unzip the file via ``tar zxf <file.tar.gz>``. Then you
   may find *start\_all.sh* under *dist/scripts/*, we call *dist* the
   ``localrepo`` in the following description.
-  for .rpm: run ``rpm -i <file.rpm>`` to install it. [Comming]

**Configure ADCaaS as Standalone Application**

Before executing ``start_all.sh`` to start ADCaaS. We need to configure
it first.

The configuration file is located under
*<localrepo>/deploy/appcluster.rc*. For more details about
configuration, see `Environment variable settings <configuration.html>`_ Page.

**Run ADCaaS as Standalone Application**

Use */scripts/start\_all.sh* to start ADCaaS.

The script will do:

1) Download dependencies if not exists locally, including dependent rpm
   files and docker images.
2) Run the container initialization.
3) Enable environment settings depending on appcluster.rc settings.
4) Run ``docker-compose up -d -f <localrepo>/deploy/docker-compose.yml``
   to start ADCAAS container and its dependent containers, see that
   *docker-compose.yml* file.

   Note: On MacOSX, running ``start_all.sh`` may get the error:

   ::

       ERROR: for ASG  Cannot start service ASG: Mounts denied:
              The path /var/tmp/ASGExtensions is not shared from OS X and is not known to Docker.       
                 You can configure shared paths from Docker -> Preferences... -> File Sharing.
                 See https://docs.docker.com/docker-for-mac/osxfs/#namespaces for more info.
            


   *Solution*: Add ``/var/tmp`` (better) or ``/var/tmp/ASGExtensions`` to the settings as it mentions.


**Check ADCaaS Running Status**

Ater executing ``start_all.sh``, use ``docker ps`` to see the container
set.

::

    1fe367969441        f5devcentral/f5-openstack-services:portal-latest      "/bin/sh -c 'python …"   44 minutes ago      Up 44 minutes       0.0.0.0:8245->80/tcp                                                                     PORTAL
    ebd02566082f        f5devcentral/f5-openstack-services:adcaas-latest      "/bin/sh -c 'node in…"   44 minutes ago      Up 44 minutes       0.0.0.0:3000->3000/tcp                                                                   ADCAAS
    3b82a0771f03        f5devcentral/f5-api-services-gateway:1.0.12           "/etc/runit/boot"        44 minutes ago      Up 44 minutes       0.0.0.0:8080->80/tcp, 0.0.0.0:8443->443/tcp                                              ASG
    dad14585530b        f5devcentral/f5-do-container:1.5.0                    "/etc/runit/boot"        44 minutes ago      Up 44 minutes       0.0.0.0:8081->80/tcp, 0.0.0.0:9443->443/tcp                                              DO
    e1617238f75f        postgres:11.1                                         "docker-entrypoint.s…"   44 minutes ago      Up 44 minutes       0.0.0.0:5432->5432/tcp                                                                   POSTGRES
    8bcb68e54237        f5devcentral/f5-openstack-services:fluentd-v1.3.2     "/bin/entrypoint.sh …"   45 minutes ago      Up 44 minutes       0.0.0.0:20001->20001/udp, 5140/tcp, 0.0.0.0:24224->24224/udp, 0.0.0.0:24224->24224/tcp   FLUENTD
    04dfcc4fab4a        docker.elastic.co/kibana/kibana:7.2.0                 "/usr/local/bin/kiba…"   45 minutes ago      Up 45 minutes       0.0.0.0:5601->5601/tcp                                                                   KIBANA
    1376e898a717        docker.elastic.co/elasticsearch/elasticsearch:7.2.0   "/usr/local/bin/dock…"   45 minutes ago      Up 45 minutes       0.0.0.0:9200->9200/tcp, 9300/tcp                                                         ELASTICSEARCH

More information about the containers' relationships, please see
`ADCaaS Delivery Mode <delivery-mode.html>`_ Page.

From docker command's output, we can see the container names, exported
ports mapping and so on.

Use ``curl http://localhost:3000/ping`` to check if ADCaaS runs OK.
Normal response is:

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

Thus we can use Postman(Swagger API definition:
https://f5networks.github.io/f5-adcaas-openstack/) or access PORTAL
(port:8245) to provision BIG-IP VE.

The PORTAL(port:8245) is integrated with OpenStack platform(Keystone for auth*, neutron for VE network setup, nova for VM sources.), so if `appcluster.rc` is configured correctly, the provisioned BIG-IP VE can be managed/orchestrated within tenant.
