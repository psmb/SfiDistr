Sfi.ru Distribution
========

**Feeling generous and want to help our non-profit?** Pick one of these issues and contribute: [![Stories in Ready](https://badge.waffle.io/psmb/sfidistr.png?label=ready&title=Ready)](https://waffle.io/psmb/sfidistr)

CircleCI integration status:
[![Circle CI](https://circleci.com/gh/psmb/SfiDistr/tree/master.svg?style=svg)](https://circleci.com/gh/psmb/SfiDistr/tree/master)

##Installation

###Install with Docker

1. Install Docker [Docker-maintained Package Installation for Ubuntu](https://docs.docker.com/installation/ubuntulinux/#ubuntu-trusty-1404-lts-64-bit)
2. Install docker-compose
 * Download the binary file to user folder (to avoid permission issues): `curl -L https://github.com/docker/compose/releases/download/1.1.0/docker-compose-`uname -s`-`uname -m` > ~/docker-compose`
 * Move to bin: `sudo mv ~/docker-compose /usr/local/bin/docker-compose`
 * Make executable: `sudo chmod +x /usr/local/bin/docker-compose`
3. Create a directory where your project files will be. By convention `/home/username/docker/project-name`
4. Copy contents of https://github.com/psmb/SfiDistr/blob/master/docker/docker-compose.yml and replace `PATH_TO_PROJECT_FILES` with something like `/home/username/docker/`
5. For local development:
  * Add local domain name (e.g. `sfi` instead of `sfi.ru`) to `/etc/hosts` and point it to `127.0.0.1`
  * Adjust `T3APP_NAME` in `docker-compose.yml` with local domain name
  * Define custom local port for web container to run on. E.g. `- 8080:80` to run on port 8080. This port needs to be different for every local project.
6. To be able to login to your ssh docker container you need to follow this guide at least up to step 4: https://help.github.com/articles/generating-ssh-keys/
7. Run `sudo docker-compose up -d` from the same directory and wait some minutes before all needed images are download and started (about 10 min on good connection).
8. To run Flow commands, ssh into the container with `ssh -p1122 www@localhost`
9. To import website data:
  * Enter ssh container (see steps 6,8).
  * Generate ssh key from within ssh container and add it to Github (just as you did for the key with which you access the ssh container itself in step 6)
  * Ask server admin to include your Github username to allowed list and to reboot the ssh container on server
  * Run `./import.sh` from within the container

###Install manually with Composer

1. Configure your LAMP stack, setup the database, Redis and so on
2. Run `git clone https://github.com/psmb/SfiDistr.git`
3. Run `composer install` 
4. Update `Configuraion/Settings.yaml` with relevant configuraion.
5. See step (7) of previous method.

####Troubleshooting

 * <i>Error in docker-compose up</i> client and server don't have same version -- Update docker

TODO: write proper readme describing all features of this distribution, location of key files etc.
