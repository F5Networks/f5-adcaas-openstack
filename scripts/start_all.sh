#!/bin/bash

cdir=`cd $(dirname $0); pwd`
(
    set -e
    cd $cdir
    chmod +x *.sh
    ./download_asg_dependencies.sh
    ./download_do.sh
    ./download_as3.sh
    ./generate_certs.sh
)

(
    cd $cdir/../deploy

    export DEPENDENCIES_DIRECTORY=`pwd`/../dependencies
    export DATA_DIRECTORY=`pwd`/../data
    export ASG_EXTENSIONS_DIRECTORY=$DEPENDENCIES_DIRECTORY/ASGExtensions
    export DATABASE_DATA_DIRECTORY=`pwd`/../data/pg_data
    export ASG_DATA_DIRECTORY=`pwd`/../data/asg_data

    docker-compose -f docker-compose.yml up -d --force-recreate --remove-orphans
)

