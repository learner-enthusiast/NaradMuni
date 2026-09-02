#!/bin/sh
set -eu

log() {
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*"
}

if [ -z "${NEON_DATABASE_URL:-}" ]; then
    log "NEON_DATABASE_URL not set; skipping backup"
    exit 0
fi

LOCAL_URL="${LOCAL_DATABASE_URL:?LOCAL_DATABASE_URL is required}"

resolve_neon_url() {
    url="$1"
    host="${url#*@}"
    host="${host%%/*}"
    host="${host%%:*}"

    ip="$(getent ahostsv4 "$host" 2>/dev/null | awk 'NR==1 { print $1; exit }')"
    if [ -z "$ip" ]; then
        printf '%s\n' "$url"
        return
    fi

    case "$url" in
        *\?*) printf '%s&hostaddr=%s\n' "$url" "$ip" ;;
        *) printf '%s?hostaddr=%s\n' "$url" "$ip" ;;
    esac
}

NEON_URL="$(resolve_neon_url "$NEON_DATABASE_URL")"

log "Starting backup from local Postgres to Neon"
pg_dump "$LOCAL_URL" --format=plain --no-owner --no-acl --clean --if-exists |
    psql "$NEON_URL" -v ON_ERROR_STOP=1 -q
log "Backup complete"
