Sfi.ru Distribution
========

##Installation

###Install with Docker

1. Install Docker latest version. Guide for Ubuntu is here [Docker-maintained Package Installation](https://docs.docker.com/installation/ubuntulinux/#ubuntu-trusty-1404-lts-64-bit)
2. Create a directory where your project files will be. By convention `/home/username/docker/project-name`
3. Add local domain name (e.g. `sfi` instead of `sfi.ru`) to `/etc/hosts` and point it to `127.0.0.1`
4. Copy contents of https://github.com/sfi-ru/SfiDistr/blob/master/docker/docker-compose.yml and modify it for local development:
  * Replace `PATH_TO_PROJECT_FILES` with smth like `/home/username/docker/`
  * Adjust `T3APP_NAME` with local domain name
  * Define custom local port for web container to run on. E.g. `- 8080:80` to run on port 8080. This port needs to be different for every local project.
5. Install docker-compose. Guide for Ubuntu is here [Install Compose](https://docs.docker.com/compose/install/)
6. Run `sudo docker-compose up -d` from the same directory and wait some minutes before all needed images are download and started (about 10 min on good connection).
6. To run Flow commands, ssh into the container with `ssh -p1122 www@localhost`
7. To import website data:
  * Ask server admin to include your Github username to allowed list
  * Enter ssh container (see step 5.).
  * Generate ssh key in container and add it to Github (https://github.com/settings/ssh)
  * Run `./import.sh` from within the container

####Troubleshooting
  * <i>Error in docker-compose up</i> client and server don't have same version... Update docker
  * <i>Error in docker-compose installation</i> Permission denied. You can at first download and then replace in target folder step by step.


###Install manually with Composer

1. Configure your LAMP stack, setup the database, Redis and so on
2. Run `git clone https://github.com/sfi-ru/SfiDistr.git`
3. Run `composer install` 
4. Update `Configuraion/Settings.yaml` with relevant configuraion.
5. See step (7) of previous method.

TODO: write proper readme describing all features of this distribution, location of key files etc.

CircleCI integration status:
[![Circle CI](https://circleci.com/gh/sfi-ru/SfiDistr/tree/master.svg?style=svg)](https://circleci.com/gh/sfi-ru/SfiDistr/tree/master)

