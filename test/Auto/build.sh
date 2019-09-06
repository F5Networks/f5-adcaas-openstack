echo "Clone repo start"
git clone https://github.com/F5Networks/f5-adcaas-openstack.git

echo "Apt update start"
sudo apt-get update

echo "Nodejs install start"
sudo apt-get install nodejs -y

echo "Npm install start"
sudo apt-get install npm -y

echo "Docker install start"
sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent     software-properties-common -y
sudo apt install docker.io -y

echo "Docker compose install start"
p=`which docker-compose`
if [ $p == "docker-compose not found" ]
then
    sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "Docker compose installed"
fi

sudo systemctl start docker

echo "App build and install start"
cd f5-adcaas-openstack/app/waf

echo "Portal install start"
sudo docker build . -t f5devcentral/f5-openstack-services:portal-latest

echo "Latest install start"
sudo docker build . -t f5devcentral/f5-openstack-services:adcaas-latest

echo "Start app"
cd ../../

# install rpm
mkdir -p dependencies/ASGExtensions/
echo "Move rpm start"
mv ../f5-appsvcs-3.10.0-5.noarch.rpm ./dependencies/
mv ../f5-declarative-onboarding-1.5.0-11.noarch.rpm ./dependencies/
mv ../TrustedASMPolicies-1.0.5-0004.noarch.rpm ./dependencies/ASGExtensions/
mv ../TrustedDevices-1.3.0-0002.noarch.rpm ./dependencies/ASGExtensions/
mv ../TrustedExtensions-1.0.1-0001.noarch.rpm ./dependencies/ASGExtensions/
mv ../TrustedProxy-1.0.1-0002.noarch.rpm ./dependencies/ASGExtensions/

cd scripts
echo "Start test"
sudo ./start_all.sh

echo "Test app"
cd ../test
sudo npm install -g newman newman-reporter-html
# sudo ./test_all.sh

