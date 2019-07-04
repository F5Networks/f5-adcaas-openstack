#!/bin/bash 

cdir=`cd $(dirname $0); pwd`
(
    set -e
    cd $cdir
    ./download_asg_dependencies.sh
)

(
    cd $cdir/../scripts
    ./download_do.sh
)

(
    cd $cdir/../deploy
    source appcluster.rc
    export DATABASE_DATA_DIRECTORY
    docker-compose -f docker-compose.yml up -d --force-recreate
)

