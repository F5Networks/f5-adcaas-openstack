#!/bin/bash 

cdir=`cd $(dirname $0); pwd`
(
    cd $cdir/../deploy
    export DEPENDENCIES_DIRECTORY=`pwd`/../dependencies
    export ASG_EXTENSIONS_DIRECTORY=$DEPENDENCIES_DIRECTORY/ASGExtensions
    export DATABASE_DATA_DIRECTORY=`pwd`/../app/waf/data
    export NGINX_CONF_DIRECTORY=`pwd`/../deploy/nginx.conf.d
    docker-compose -f docker-compose-asg.yml -f docker-compose.yml down
)

