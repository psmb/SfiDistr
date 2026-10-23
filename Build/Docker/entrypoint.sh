#!/usr/bin/env bash
set -euo pipefail

cat > "$PHP_INI_DIR/conf.d/sfi.ini" <<INI
date.timezone=${PHP_TIMEZONE:-Europe/Moscow}
memory_limit=${PHP_MEMORY_LIMIT:-4096M}
upload_max_filesize=${PHP_UPLOAD_MAX_FILESIZE:-1024M}
post_max_size=${PHP_UPLOAD_MAX_FILESIZE:-1024M}
max_execution_time=${PHP_MAX_EXECUTION_TIME:-240}
max_input_vars=1500
INI
sed "s|__FLOW_CONTEXT__|${FLOW_CONTEXT:-Production}|g" /opt/sfi/nginx.conf > /etc/nginx/nginx.conf

mkdir -p /data/www/Data /data/www/Web/_Resources /data/.ssh /run/sshd
chown www-data:www-data /data/www/Data /data/www/Web/_Resources /data/.ssh
chmod 700 /data/.ssh
ssh-keygen -A
# Public-key authentication only; the account must not be locked in Alpine.
usermod_password=$(openssl rand -hex 32)
printf 'www-data:%s\n' "$usermod_password" | chpasswd
unset usermod_password
if [[ -n "${IMPORT_GITHUB_PUB_KEYS:-}" ]]; then
    : > /data/.ssh/authorized_keys
    for github_user in ${IMPORT_GITHUB_PUB_KEYS//,/ }; do
        curl --fail --silent --show-error "https://github.com/${github_user}.keys" >> /data/.ssh/authorized_keys
        printf '\n' >> /data/.ssh/authorized_keys
    done
    chown www-data:www-data /data/.ssh/authorized_keys
    chmod 600 /data/.ssh/authorized_keys
fi

if [[ -n "${DB_AUTO_BACKUP:-}" ]]; then
    case "$DB_AUTO_BACKUP" in
        daily|hourly|weekly|monthly) ln -sf /opt/sfi/backupDb.sh "/etc/periodic/$DB_AUTO_BACKUP/backupDb" ;;
        *) echo "Unsupported DB_AUTO_BACKUP interval" >&2; exit 1 ;;
    esac
fi

cd /data/www
# Database/content migrations are explicit deployment steps, never automatic.
su-exec www-data ./flow resource:publish --collection static
exec "$@"
