#!/bin/bash 

as3file="https://github.com/F5Networks/f5-appsvcs-extension/releases/download/v3.14.0/f5-appsvcs-3.14.0-4.noarch.rpm"

cdir=`cd $(dirname $0); pwd`
(
    cd $cdir/../dependencies
    if [ ! -f  `basename $as3file` ]; then 
	    wget $as3file
   fi
)

