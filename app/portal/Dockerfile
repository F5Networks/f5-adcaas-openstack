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
workdir /root
RUN rm -rf /root/horizon
COPY horizon /root/horizon
ENV OS_AUTH_URL='http://keystone-endpoint:5000/v3'
ENV ADCAAS_APP_HOST='adcaas-server'
ENV ADCAAS_APP_PORT=3000
ENV ADCAAS_APP_PROTOCOL=http
RUN python /root/horizon/manage.py collectstatic --no-input
RUN python /root/horizon/manage.py compress --force

ENTRYPOINT python /root/horizon/manage.py runserver 0:80
