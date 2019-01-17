#!/bin/bash

if [ $# -ne 1 ]; then
  echo "$0 <setting file>"
  exit 1
fi

settings=$1
if [ ! -f "$settings" ]; then
  echo "invalid setting file: $settings"
  exit 1
fi

which docker > /dev/null
if [ $? -ne 0 ]; then
  echo "Error: docker package not installed."
  exit 1
fi

source $settings

docker rm --force $application_hostname $postgres_hostname
