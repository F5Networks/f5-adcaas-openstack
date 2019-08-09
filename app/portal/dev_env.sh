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

