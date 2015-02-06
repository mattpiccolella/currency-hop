#/bin/bash

echo "Updating system"
apt-get -qq update
apt-get -yqqf upgrade

# Git
command -v git > /dev/null
if [ $? -ne 0 ]; then
  echo "Installing Git"
  apt-get -yqq install git
fi

# Build Essentials
echo "Installing Build Essentials"
sudo apt-get install build-essential python-dev libmysqlclient-dev

# Pip
command -v pip > /dev/null
if [ $? -ne 0 ]; then
  echo "Installing Pip"
  apt-get -yqq install python-pip
fi

cd /vagrant
