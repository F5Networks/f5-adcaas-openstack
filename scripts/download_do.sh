#!/bin/bash 

# TODO: make filelist configurable.
dofile="https://github.com/F5Networks/f5-declarative-onboarding/releases/download/v1.5.0/f5-declarative-onboarding-1.5.0-11.noarch.rpm"

cdir=`cd $(dirname $0); pwd`
(
    cd $cdir/../dependencies
    if [ ! -f  `basename $dofile` ]; then 
	    wget $dofile
   fi
)

