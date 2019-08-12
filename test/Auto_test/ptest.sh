#!/bin/bash
source ./shared-queens.rc
openstack token issue
# get token

openstack server create --flavor newman-test-web-server-flavor --image ubuntu-bionic-server-cloudimg-amd64-20190501 --nic net-id=655a8581-3771-43b4-8cb4-2df01f0fa25c --key-name zz test_instance --config-drive True
# create server

p=`openstack server list --name test_instance -f value -c Status`
while [ $p != ACTIVE ]
do
    echo $p
    p=`openstack server list --name test_instance -f value -c Status`
done
echo $p

ip=`openstack server list --name test_instance -f value -c Networks | cut -c13-`
# get ip

echo $ip

pass=`ping $ip -c 1 -t 2 | awk 'NR==5{print}' | cut -c24-25`
while [ [$pass == " "] ]
do
    pass=`ping $ip -c 1 -t 2 | awk 'NR==5{print}' | cut -c24-25`
    echo $pass
done

while true; do 
	echo "sshing $ip..."
	ssh -o "StrictHostKeyChecking no" -i zz.pem ubuntu@$ip echo x
	if [ $? -eq 0 ]; then break; fi;
	sleep 1;
done

ssh -o "StrictHostKeyChecking no" -i zz.pem ubuntu@$ip
# enter the server





