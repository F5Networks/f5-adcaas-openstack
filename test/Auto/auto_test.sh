#!/bin/bash
source ./shared-queens.rc
sudo apt install python-dev python-pip
sudo pip install --upgrade pip
sudo pip install --ignore-installed python-openstackclient

openstack server create --flavor m1.large --image $TEST_IMAGE --nic net-id=$NET_ID --key-name zz test_instance_$name --config-drive True
# create server
# AutotestSS - Basic
# AutotestS1 - With rpm
# AutotestS2 - With all build

sudo chmod 600 zz.pem
p=`openstack server list --name test_instance_$name -f value -c Status`
while [ $p != ACTIVE ]
do
    echo $p
    p=`openstack server list --name test_instance_$name -f value -c Status`
done
echo $p

ip=`openstack server list --name test_instance_$name -f value -c Networks | cut -c13-`
# get ip

echo $ip

pass=`ping $ip -c 1 -t 2 | awk 'NR==5{print}' | cut -c24-25`
while [ [$pass == " "] ]
do
    pass=`ping $ip -c 1 -t 2 | awk 'NR==5{print}' | cut -c24-25`
    echo $pass
done
# pass test

try=0
while [ $try -lt 100 ] 
do 
    try=`expr $try + 1`
	echo "sshing $ip..."
	ssh -o "StrictHostKeyChecking no" -i zz.pem ubuntu@$ip echo x
	if [ $? -eq 0 ]; then break; fi;
	sleep 1;
done

ssh -o "StrictHostKeyChecking no" -i zz.pem ubuntu@$ip 'bash -s' < build.sh
# enter the server
