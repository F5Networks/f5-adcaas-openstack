#!/bin/bash -ex

export DATABASE_PORT=5432
export DATABASE_HOST=127.0.0.1
npm --prefix app/waf start >/dev/null 2>&1 &

INTERVAL=5
RETRY=6

set +e
while [ $RETRY -gt 0 ] ; do
  sleep $INTERVAL
  curl -s -X GET http://localhost:3000/ping
  if [ $? -eq 0 ] ; then
    RETRY=-1
  else
    ((RETRY=RETRY-1))
  fi
done
set -e

if [ $RETRY -eq 0 ] ; then
  echo "Fail to start app"
  exit 1
fi

git clone https://github.com/F5Networks/f5-adcaas-openstack.git
cd f5-adcaas-openstack
git checkout gh-pages
HOST="localhost:3000"
curl -s -X GET http://${HOST}/openapi.json > openapi.json
curl -s -X GET http://${HOST}/explorer/ > index.html

for file in swagger-ui.css swagger-ui-bundle.js swagger-ui-standalone-preset.js favicon-16x16.png favicon-32x32.png ; do
  curl -s -X GET http://${HOST}/explorer/${file} > ${file}
done

sed -i 's/LoopBack API Explorer/F5 ADCaaS API Specification/g' index.html
sed -i 's/\/openapi.json/.\/openapi.json/g' index.html

git config --global user.email "q.zhao@f5.com"
git config --global user.name "Qin Zhao"
git config --global credential.helper "$(pwd)/git-credential.sh"

git commit -a -m "Travis CI $TRAVIS_BUILD_WEB_URL" || true
git push origin gh-pages
