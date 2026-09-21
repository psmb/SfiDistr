#!/usr/bin/env bash
# Keep Docker secrets available to PHP and scheduled jobs.
for secret in /run/secrets/*; do
    [[ -f "$secret" ]] || continue
    name=$(basename "$secret")
    [[ "$name" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
    export "$name=$(cat "$secret")"
done

case "${FLOW_CONTEXT:-Production}" in
    Production|Production/*)
        if [[ -z "${FLOW_ENCRYPTION_KEY:-}" ]]; then
            echo "FLOW_ENCRYPTION_KEY must contain the existing deployment's Flow signing key (environment or /run/secrets/FLOW_ENCRYPTION_KEY)." >&2
            exit 1
        fi
        ;;
esac
