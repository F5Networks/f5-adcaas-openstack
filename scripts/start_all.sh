#!/bin/bash 

cdir=`cd $(dirname $0); pwd`
(
    set -e
    cd $cdir
    ./download_asg_dependencies.sh
    ./download_do.sh
    ./download_as3.sh
)

(
    cd $cdir/../deploy
    export DEPENDENCIES_DIRECTORY=`pwd`/../dependencies
    export ASG_EXTENSIONS_DIRECTORY=$DEPENDENCIES_DIRECTORY/ASGExtensions
    export DATABASE_DATA_DIRECTORY=`pwd`/../app/waf/data
    export NGINX_CONF_DIRECTORY=`pwd`/../deploy/nginx
    export ASG_DATA_DIRECTORY=`pwd`/../data/asg_data
    docker-compose -f docker-compose-asg.yml -f docker-compose.yml up -d --force-recreate --remove-orphans
)

