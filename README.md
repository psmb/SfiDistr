Sfi.ru Distribution
========

##How to get things running.

First install docker and fig, then:

git clone https://github.com/sfi-ru/SfiDistr.git
cd Sfi/Distr/docker
sudo docker build -t dimaip/sfi:latest --no-cache .
sudo fig up
ssh -p 1122 www@YOUR_DOCKER_IP
