#!/bin/bash 

cdir=`cd $(dirname $0); pwd`
source $cdir/../deploy/appcluster.rc
if [ x"$ADCAAS_PROTOCOL" = x"https" ]; then
    certsdir=$cdir/../data/certs
    mkdir -p $certsdir
    openssl req -newkey rsa:2048 -nodes -keyout $certsdir/domain.key -x509 \
        -days 365 -out $certsdir/domain.crt \
        -subj "/C=CN/ST=BJ/L=BJ/O=Example/OU=IT/CN=f5.com"
fi
