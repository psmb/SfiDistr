FROM dimaip/docker-neos-alpine:latest
ENV PHP_TIMEZONE=Europe/Moscow
ENV AWS_ENDPOINT=https://hb.ru-msk.vkcloud-storage.ru
ENV AWS_BACKUP_ARN=s3://psmb-neos-resources/db/sfi/
ENV REPOSITORY_URL=https://github.com/psmb/SfiDistr
ENV DONT_PUBLISH_PERSISTENT=1
WORKDIR /data/www-provisioned
RUN curl -fsSL https://repo.harica.gr/certs/HARICA-TLS-Root-2021-RSA.cer -o /tmp/harica-root.cer && \
    echo "d95d0e8eda79525bf9beb11b14d2100d3294985f0c62d9fabd9cd999eccb7b1d  /tmp/harica-root.cer" | sha256sum -c - && \
    openssl x509 -inform DER -in /tmp/harica-root.cer -out /usr/local/share/ca-certificates/HARICA_TLS_RSA_Root_CA_2021.crt && \
    update-ca-certificates && \
    rm /tmp/harica-root.cer && \
    chown -R 80:80 /composer/ && \
    chown -R 80:80 /var/tmp/nginx && \
    chown -R 80:80 /data/www-provisioned && \
    /bin/bash -c "source /init-php-conf.sh"
USER 80
COPY --chown=80:80 composer.json /data/www-provisioned/composer.json
COPY --chown=80:80 composer.lock /data/www-provisioned/composer.lock
RUN composer install && \
    rm -rf /composer/cache && \
    mkdir -p /data/www-provisioned/Configuration && \
    cp /Settings.yaml /data/www-provisioned/Configuration/
COPY --chown=80:80 ./ /data/www-provisioned/
RUN composer run-script post-update-cmd && git remote set-url origin $REPOSITORY_URL
USER root
# HEALTHCHECK --interval=30s --timeout=15s --start-period=30s --retries=3 CMD curl -f http://localhost/ | grep "This website is powered by Neos"
