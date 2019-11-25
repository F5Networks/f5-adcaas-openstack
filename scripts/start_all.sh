#!/bin/bash

function check() {
    echo Checking running dependencies...

    ready=1
    for n in wget docker docker-compose; do
        which $n > /dev/null 2>&1
        if [ $? -ne 0 ]; then
            ready=0
            echo $n not installed.
        fi
    done
    if [ $ready -ne 1 ]; then exit 1; fi

    docker ps > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "docker damon is not running."
        exit 1
    fi
}

check

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

    . appcluster.rc

    efk_option=""
    if [ x"$ENABLE_EFK" == x"true" ]
    then
      echo 'Package installed with EFK...'
      efk_option="-f docker-compose-efk.yml "
    fi

    docker-compose -f docker-compose.yml $efk_option up -d --force-recreate --remove-orphans
)

