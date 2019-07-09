#!/bin/bash 

# TODO: make ../dependencies/ASGExtensions  and filelist configurable.
filelist="
https://github.com/jgruber/TrustedDevices/releases/download/1.3.0/TrustedDevices-1.3.0-0002.noarch.rpm
https://github.com/jgruber/TrustedProxy/releases/download/1.0.1/TrustedProxy-1.0.1-0002.noarch.rpm
https://github.com/jgruber/TrustedExtensions/releases/download/1.0.1/TrustedExtensions-1.0.1-0001.noarch.rpm
https://github.com/jgruber/TrustedASMPolicies/releases/download/1.0.5/TrustedASMPolicies-1.0.5-0004.noarch.rpm
"

cdir=`cd $(dirname $0); pwd`
mkdir -p $cdir/../dependencies/ASGExtensions

(
    cd $cdir/../dependencies/ASGExtensions
    for n in $filelist; do
        filebase=`basename $n`
        if [ ! -f $filebase ]; then 
            wget $n
        fi
    done
)

