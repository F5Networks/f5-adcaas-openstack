#!/bin/bash -e

VPNDEB=ps-pulse-linux-9.1r1.0-b21-ubuntu-debian-64-bit-installer.deb

sudo apt-get -y update

if [ ! -f $VPNDEB ] ; then
  wget https://github.com/zhaoqin-github/misc/raw/master/deb/$VPNDEB
fi

sudo dpkg --install $VPNDEB
sudo patch /usr/local/pulse/PulseClient_x86_64.sh PulseClient_x86_64.sh.patch
sudo /usr/local/pulse/PulseClient_x86_64.sh install_dependency_packages
cat vpn.crt | sudo tee -a /etc/ssl/certs/ca-certificates.crt
