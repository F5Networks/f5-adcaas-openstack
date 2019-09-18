#!/bin/bash 

as3file="https://github.com/F5Networks/f5-appsvcs-extension/releases/download/v3.14.0/f5-appsvcs-3.14.0-4.noarch.rpm"

cdir=`cd $(dirname $0); pwd`
(
    cd $cdir/../dependencies
    if [ ! -f  `basename $as3file` ]; then 
        wget -nv $as3file # $as3file.sha256
        #sha256sum -c $as3file.sha256
   fi
)

