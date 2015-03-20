Sfi.ru Distribution
========

##Installation

###Install with Docker

1. Install Docker
2. Create a directory where your project files will be. By convention `/home/username/docker/project-name`
3. Copy contents of https://github.com/sfi-ru/SfiDistr/blob/master/docker/docker-compose.yml and replace `PATH_TO_PROJECT_FILES` with smth like `/home/username/docker/`
4. For local development:
  * Add local domain name (e.g. `sfi` instead of `sfi.ru`) to `/etc/hosts` and point it to `127.0.0.1`
  * Adjust `T3APP_NAME` in `docker-compose.yml` with local domain name
  * Define custom local port for web container to run on. E.g. `- 8080:80` to run on port 8080. This port needs to be different for every local project.
5. Run `sudo docker-compose up -d` from the same directory and wait some minutes before all needed images are download and started (about 10 min on good connection).
6. To run Flow commands, ssh into the container with `ssh -p1122 www@localhost`
7. To import website data:
  * Ask server admin to include your Github username to allowed list
  * Enter ssh container (see step 5.).
  * Generate ssh key in container and add it to Github (https://github.com/settings/ssh)
  * Run `./import.sh` from within the container

###Install manually with Composer

1. Configure your LAMP stack, setup the database, Redis and so on
2. Run `git clone https://github.com/sfi-ru/SfiDistr.git`
3. Run `composer install` 
4. Update `Configuraion/Settings.yaml` with relevant configuraion.
5. See step (7) of previous method.

TODO: write proper readme describing all features of this distribution, location of key files etc.

CircleCI integration status:
[![Circle CI](https://circleci.com/gh/sfi-ru/SfiDistr/tree/master.svg?style=svg)](https://circleci.com/gh/sfi-ru/SfiDistr/tree/master)

