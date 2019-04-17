FROM dimaip/docker-neos-alpine:latest
ENV PHP_TIMEZONE=Europe/Moscow
ENV AWS_ENDPOINT=https://hb.bizmrg.com
ENV AWS_BACKUP_ARN=s3://psmb-neos-resources/db/sfi/
ENV REPOSITORY_URL=https://github.com/psmb/SfiDistr
ENV DONT_PUBLISH_PERSISTENT=1
COPY --chown=80:80 composer.json /data/www-provisioned/composer.json
RUN cd /data/www-provisioned && \
    composer install && \
    rm -rf /composer/cache && \
    mkdir -p /data/www-provisioned/Configuration && \
    cp /Settings.yaml /data/www-provisioned/Configuration/ && \
    /bin/bash -c "source /init-php-conf.sh"
COPY --chown=80:80 ./ /data/www-provisioned/
