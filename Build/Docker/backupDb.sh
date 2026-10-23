#!/usr/bin/env bash
set -euo pipefail
mkdir -p /data/www/Data/Persistent
export MYSQL_PWD="$DB_PASS"
mariadb-dump --single-transaction --skip-lock-tables --skip-ssl \
    --user="$DB_USER" --host="$DB_HOST" "$DB_DATABASE" > /data/www/Data/Persistent/db.sql
unset MYSQL_PWD
if [[ -n "${AWS_BACKUP_ARN:-}" ]]; then
    endpoint_options=()
    [[ -z "${AWS_ENDPOINT:-}" ]] || endpoint_options=(--endpoint-url "$AWS_ENDPOINT")
    aws "${endpoint_options[@]}" s3 cp /data/www/Data/Persistent/db.sql "${AWS_BACKUP_ARN}db.sql"
fi
