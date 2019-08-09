# build with:
#   docker build . -t f5devcentral/f5-services-portal:latest

FROM centos:7

RUN yum update -y
RUN yum install -y epel-release
RUN yum install -y centos-release-openstack-queens.noarch
RUN yum install -y openstack-dashboard

#ENV PYTHONDONTWRITEBYTECODE=1
COPY openstack-dashboard /usr/share/openstack-dashboard

WORKDIR /usr/share/openstack-dashboard
RUN python manage.py collectstatic --no-input
RUN python manage.py compress

ENTRYPOINT python /usr/share/openstack-dashboard/manage.py runserver 0:80
