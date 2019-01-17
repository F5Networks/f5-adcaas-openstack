#!/bin/bash

cdir=$(cd `dirname $0`; pwd)

settings=$cdir/settings
if [ ! -f "$settings" ]; then
  echo "Error: invalid setting file: $settings"
  exit 1
fi

source $settings

# start postgres docker container.

docker ps -a | grep $postgres_hostname > /dev/null
if [ $? -eq 0 ]; then
    echo "Stop and remove $postgres_hostname container.."
    docker rm --force $postgres_hostname
fi

mkdir -p $postgres_data_directory

docker run \
    -p $postgres_port:5432 \
    -v $postgres_data_directory:/var/lib/postgresql/data \
    -e POSTGRES_PASSWORD=$postgres_password \
    -e POSTGRES_USER=$postgres_user \
    -e POSTGRES_DB=$postgres_db \
    --name $postgres_hostname \
    -d postgres:latest

