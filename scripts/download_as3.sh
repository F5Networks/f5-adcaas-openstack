#!/bin/bash 

as3file="https://github.com/F5Networks/f5-appsvcs-extension/releases/download/v3.10.0/f5-appsvcs-3.10.0-5.noarch.rpm"

cdir=`cd $(dirname $0); pwd`
(
    cd $cdir/../dependencies
    if [ ! -f  `basename $as3file` ]; then 
	    wget $as3file
   fi
)

