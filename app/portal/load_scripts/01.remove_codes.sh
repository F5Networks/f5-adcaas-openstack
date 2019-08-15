#!/bin/bash -x

if [ -z "$dst" ]; then 
    echo "dst cannot be empty. quit."
    exit 1; 
fi; 

rm -rf $dst/openstack_dashboard/enabled/_1*
rm -rf $dst/openstack_dashboard/enabled/_2*
rm -rf $dst/openstack_dashboard/enabled/_3*
rm -rf $dst/openstack_dashboard/enabled/_4*
rm -rf $dst/openstack_dashboard/enabled/_5*

