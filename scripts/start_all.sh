#!/bin/bash 

cdir=`cd $(dirname $0); pwd`
(
    set -e
    cd $cdir
    ./download_asg_dependencies.sh
)

(
    cd $cdir/../deploy
    docker-compose -f docker-compose.yml up -d --force-recreate
)
