#!/bin/bash

cdir=$(cd `dirname $0`; pwd)

settings=$cdir/settings
if [ ! -f "$settings" ]; then
  echo "Error: invalid setting file: $settings"
  exit 1
fi

which docker > /dev/null
if [ $? -ne 0 ]; then
  echo "Error: docker package not installed."
  exit 1
fi

source $settings

# start application in docker container

docker ps -a | grep $application_hostname > /dev/null
if [ $? -eq 0 ]; then
    echo "Stop and remove $application_hostname container.."
    docker rm --force $application_hostname
fi

app_dir_in_docker=/root/app_dir
docker run -itd \
  --name $application_hostname \
  -v $application_folder:$app_dir_in_docker \
  -p $application_port:3000 \
  node:$node_version bash
if [ $? -ne 0 ]; then
  echo "Error: failed to start node container: $application_hostname"
  exit 1
fi

echo "Installing dependencies ..."
docker exec $application_hostname /usr/local/bin/npm install
if [ $? -ne 0 ]; then
  echo "Error: failed to install dependencies."
  exit 1
fi

echo "Installing @loopback/cli ..."
docker exec $application_hostname /usr/local/bin/npm i -g @loopback/cli
if [ $? -ne 0 ]; then
  echo "Error: failed to install lookback/cli."
  exit 1
fi

echo
echo " ==== Application starts successfully. ===="
echo
echo "Use the command to start your application."
echo
echo "   docker exec -it $application_hostname bash -c \"cd $app_dir_in_docker && npm start\""
echo
echo
