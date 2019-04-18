#!/bin/bash 

cdir=`cd $(dirname $0); pwd`
(
    set -e
    cd $cdir
    ./download_asg_dependencies.sh
    source ../deploy/appcluster.rc
    docker-compose -f ../deploy/docker-compose.yml up -d --force-recreate
)
