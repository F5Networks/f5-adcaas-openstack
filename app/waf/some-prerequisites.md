## Some preparations in the OpenStack platform

**Prepare the BIGIP VE image**:

Currently, the tested image is 13.1.1. First of all, you need to download BIGIP VE image from F5's official website downloads.f5.com. Then you can use the OpenStack Dashboard to create an image in Glance or you can use CLI. e.g.

glance image-create --container-format bare --disk-format qcow2 --file /home/admin/BIGIP-13.1.1-0.0.4.qcow2 --visibility public --progress

**Prepare the Nova flavors**:

* You can use the OpenStack Dashboard or the openstack CLI to prepare the flavors. e.g.
openstack flavor create bigip-ve-13-flavor --id auto --ram 8192 --disk 160 --vcpus 4

* More info can be found on following sites:
https://clouddocs.f5.com/cloud/openstack/v1/support/openstack_big-ip_flavors.html
https://docs.openstack.org/horizon/latest/admin/manage-flavors.html

**Prepare networks and subnets**:

* You need 4 openstack networks for management, internal, external and HA purposes respectively. Create a subnet in each of the networks. You can use the OpenStack Dashboard or the openstack CLI to prepare the networks and subnets.

* When you use the APIs to create an ADC instance, you have to provide these 4 network ids and our ADCaaS API will create a port for the ADC instance in each of the 4 networks.

* For management network, create a provider network. e.g.

 neutron net-create --shared --provider:physical_network provider \
  --provider:network_type vlan --provider:segmentation_id 1234 provider1

 neutron subnet-create --name provider1-v4-subnet --ip-version 4 \
   --allocation-pool start=203.0.113.11,end=203.0.113.250 \
   --gateway 203.0.113.1 --dns-nameserver 8.8.4.4 provider1 \
   203.0.113.0/24

* For other networks, e.g.

 neutron net-create internal-net

 neutron subnet-create internal-net 192.168.111.0/24 --name internal-subnet