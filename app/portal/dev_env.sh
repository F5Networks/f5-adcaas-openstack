#!/bin/bash 

cdir=`cd $(dirname $0); pwd`
(
    cd $cdir
    docker rm --force portal_devenv
    docker run \
        --rm \
        -itd \
        -p 8000:80 \
        --env PYTHONDONTWRITEBYTECODE=1 \
        --env-file ../../deploy/appcluster.rc \
        -v $cdir/openstack-dashboard:/usr/share/openstack-dashboard \
        --entrypoint bash \
        --name portal_devenv \
        f5devcentral/f5-services-portal:latest
)

# using python virtual environment: 
#   pip install python-cinderclient==3.5.0 python-glanceclient==2.10.1 python-keystoneclient==3.15.0 python-neutronclient==6.7.0 python-novaclient==10.1.0 python-swiftclient==3.5.0 horizon==13.0.2
#   notice: the virtual environment is not as same as container, so some problems may be like: 
#           1) horizon.base Could not process panel profiler: compress works not same with that in container; horizon module was not loaded correctly. 
