#!/bin/bash

pwddir=$PWD
cdir=$pwddir/$(dirname $0)

envfile=$cdir/../deploy/appcluster.rc

while getopts 'e:h' option; do
    case $option in
        h) echo "$0 [-e <env file>]"; exit 0; ;;
        e) envfile="$2"; shift; shift; ;;
    esac
done

echo $envfile | grep -E "^/" > /dev/null
if [ $? -ne 0 ]; then envfile=$pwddir/$envfile; fi

echo Using $envfile ...
if [ ! -f $envfile ]; then
    echo "file $envfile not exists. quit."
    exit 1
fi

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

    export ENVIRON_FILE=$envfile
    docker-compose -f docker-compose.yml up -d --force-recreate --remove-orphans
)

