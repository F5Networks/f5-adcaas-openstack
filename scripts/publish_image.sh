#!/bin/bash -e

REPO=f5devcentral/f5-openstack-services
TAG=$(git describe --tags --abbrev=0)
ADCAAS_IMAGE=$REPO:adcaas-$TAG
PORTAL_IMAGE=$REPO:portal-$TAG
ADCAAS_IMAGE_LATEST=$REPO:adcaas-latest
PORTAL_IMAGE_LATEST=$REPO:portal-latest

pushd app/waf
echo "Build $ADCAAS_IMAGE"
docker build -t $ADCAAS_IMAGE .
docker tag $ADCAAS_IMAGE $ADCAAS_IMAGE_LATEST
popd

pushd app/portal
echo "Build $PORTAL_IMAGE"
docker build -t $PORTAL_IMAGE .
docker tag $PORTAL_IMAGE $PORTAL_IMAGE_LATEST
popd

docker login -u $DOCKER_USER -p $DOCKER_PASS

echo "Publishing $ADCAAS_IMAGE"
docker push $ADCAAS_IMAGE
echo "Publishing $ADCAAS_IMAGE_LATEST"
docker push $ADCAAS_IMAGE_LATEST

echo "Publishing $PORTAL_IMAGE"
docker push $PORTAL_IMAGE
echo "Publishing $PORTAL_IMAGE_LATEST"
docker push $PORTAL_IMAGE_LATEST

docker logout
