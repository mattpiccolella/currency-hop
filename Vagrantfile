# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # Use an Ubuntu 12.04 64-bit VirtualBox image
  config.vm.box = "precise64"
  config.vm.box_url = "http://cloud-images.ubuntu.com/vagrant/precise/current/precise-server-cloudimg-amd64-vagrant-disk1.box"

  config.vm.network "private_network", type: "dhcp"
  # Access port 5000 via localhost:5000
  config.vm.network :forwarded_port, guest: 5000, host: 5000

  # SSH Key Forwarding
  config.ssh.forward_agent = true

  # Increase the default memory
  config.vm.provider :virtualbox do |vb|
    vb.customize ["modifyvm", :id, "--memory", "1024"]
  end

  config.vm.provision "shell", path: "development/provision.sh"
end