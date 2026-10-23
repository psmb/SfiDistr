FROM php:8.3-fpm-alpine3.22

ENV PHP_TIMEZONE=Europe/Moscow \
    PHP_MEMORY_LIMIT=4096M \
    FLOW_CONTEXT=Production \
    FLOW_REWRITEURLS=1 \
    COMPOSER_ALLOW_SUPERUSER=1 \
    DB_DATABASE=db \
    DB_HOST=db \
    DB_USER=admin \
    DB_PASS=pass \
    AWS_ENDPOINT=https://hb.ru-msk.vkcloud-storage.ru \
    AWS_BACKUP_ARN=s3://psmb-neos-resources/db/sfi/

RUN apk add --no-cache bash ca-certificates curl git nginx supervisor su-exec \
        mariadb-client aws-cli openssh rsync tzdata icu-libs libzip libpng libjpeg-turbo freetype \
        optipng libjpeg-turbo-utils \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS icu-dev libzip-dev \
        libpng-dev libjpeg-turbo-dev freetype-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j2 gd pdo_mysql opcache intl exif zip

RUN curl --fail --show-error --location --retry 3 \
        https://codeload.github.com/phpredis/phpredis/tar.gz/refs/tags/6.2.0 \
        --output /tmp/phpredis.tar.gz \
    && echo '470333b27cbf9485d36b610b81300c06491a6575f22c6801a9cefc55285ed123  /tmp/phpredis.tar.gz' | sha256sum -c - \
    && docker-php-source extract \
    && mkdir -p /usr/src/php/ext/redis \
    && tar -xzf /tmp/phpredis.tar.gz --strip-components=1 -C /usr/src/php/ext/redis \
    && docker-php-ext-install -j2 redis \
    && docker-php-source delete \
    && rm /tmp/phpredis.tar.gz \
    && apk del .build-deps \
    && deluser www-data \
    && (delgroup cdrw || true) \
    && addgroup -g 80 www-data \
    && adduser -D -u 80 -G www-data -h /data -s /bin/bash www-data \
    && mkdir -p /data/www-provisioned /var/lib/nginx /var/tmp/nginx /run/nginx \
    && chown -R www-data:www-data /data /var/lib/nginx /var/tmp/nginx \
    && printf 'clear_env = no\n' > /usr/local/etc/php-fpm.d/zz-environment.conf

COPY --from=composer:2.8 /usr/bin/composer /usr/local/bin/composer
COPY Build/Docker/ /opt/sfi/
RUN chmod +x /opt/sfi/*.sh \
    && cp /opt/sfi/nginx.conf /etc/nginx/nginx.conf \
    && cp /opt/sfi/supervisord.conf /etc/supervisord.conf \
    && ln -s /opt/sfi/backupDb.sh /data/backupDb.sh \
    && printf '\nPasswordAuthentication no\nPermitRootLogin no\nAllowUsers www-data\n' >> /etc/ssh/sshd_config

WORKDIR /data/www-provisioned
COPY --chown=www-data:www-data ./ ./
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader \
    && composer clear-cache \
    && cp /opt/sfi/Settings.yaml Configuration/Settings.yaml \
    && chown -R www-data:www-data /data/www-provisioned \
    && ln -s /data/www-provisioned /data/www \
    && printf '* * * * * cd /data/www && ./cron-minutely\n0 * * * * cd /data/www && ./cron-hourly\n' | crontab -u www-data -

EXPOSE 80 22
ENTRYPOINT ["/opt/sfi/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
