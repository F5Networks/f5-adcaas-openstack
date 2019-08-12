#!/bin/bash

INTERVAL=10
RETRY=6

/usr/local/pulse/PulseClient_x86_64.sh -h $VPN_HOST -u $VPN_USER -p $VPN_PASS -r Users > /dev/null &

while [ $RETRY -gt 0 ] ; do
  sleep $INTERVAL
  echo "Check VPN status $RETRY"
  ((RETRY=RETRY-1))
  /usr/local/pulse/PulseClient_x86_64.sh -S | grep "connection status : Connected"

  if [ $? -eq 0 ] ; then
    RETRY=-1
  fi
done

if [ $RETRY -eq 0 ] ; then
  echo "Fail to connect VPN"
  cat ~/.pulse_secure/pulse/pulsesvc.log
  exit 1
fi

ping -c 3 $OS_HOST
