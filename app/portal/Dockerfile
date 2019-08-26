# build with:
#   docker build . -t f5devcentral/f5-openstack-services:portal-latest

# TODO: can we run kolla horizon image?
# TODO: run it with nginx instead of centos:7, too large..
# See: https://developer.rackspace.com/blog/keystone_horizon_nginx/
FROM centos:7.6.1810

RUN yum update -y
RUN yum install -y epel-release

# Install it from source will be more controllable.
# see: https://docs.openstack.org/horizon/latest/install/from-source.html#installation
#RUN yum install -y centos-release-openstack-queens.noarch
#RUN yum install -y openstack-dashboard

RUN yum install -y git gcc python-devel python-pip
WORKDIR /root
RUN git clone https://opendev.org/openstack/horizon -b stable/queens --depth=1
WORKDIR /root/horizon
RUN pip install -c https://opendev.org/openstack/requirements/raw/branch/stable/queens/upper-constraints.txt .

COPY src /root/src
COPY load_scripts /root/load_scripts
RUN chmod -R +x /root/load_scripts/*
RUN /root/load_scripts/load.sh /root/src /root/horizon

ENTRYPOINT python /root/horizon/manage.py runserver 0:80
