#!/bin/bash 

source `dirname $0`/cdir.rc

find $cdir/../horizon -name "*.py[c|o]" -exec rm -f {} \;
