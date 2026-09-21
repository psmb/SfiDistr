#!/usr/bin/env bash
set -euo pipefail
source /opt/sfi/load-secrets.sh
cd /data/www
exec ./flow "$@"
