#!/bin/bash 

# this script will be used to generate rpm package in the future.

if [ $# -ne 2 ]; then echo "$0 src dst"; exit 1; fi

export src=$1
export dst=$2

echo "arguments: src: $src, dst: $dst"
if [ ! -d $dst -o ! -d $dst/openstack_dashboard ]; then 
    echo "$dst not exists or not containing openstack_dashboard subfolder."; 
    exit 1; 
fi;

(
    cd $dst
    scripts=`ls /root/load_scripts/[0-9]*.sh`
    echo scripts: $scripts
    for n in $scripts; do 
        echo executing $n ...
        $n
    done
)
