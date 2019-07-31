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

    certsdir=$cdir/../data/certs
    mkdir $certsdir
    openssl req -newkey rsa:2048 -nodes -keyout $certsdir/domain.key -x509 -days 365 -out $certsdir/domain.crt -subj "/C=CN/ST=BJ/L=BJ/O=Example/OU=IT/CN=f5-adcaas.com/emailAddress=f5-adcaas@example.com"

    export DEPENDENCIES_DIRECTORY=`pwd`/../dependencies
    export DATA_DIRECTORY=`pwd`/../data
    export ASG_EXTENSIONS_DIRECTORY=$DEPENDENCIES_DIRECTORY/ASGExtensions
    export DATABASE_DATA_DIRECTORY=`pwd`/../data/pg_data
    docker-compose -f docker-compose.yml up -d --force-recreate
)

