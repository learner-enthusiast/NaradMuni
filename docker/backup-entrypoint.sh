#!/bin/sh
set -eu

log() {
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*"
}

chmod +x /usr/local/bin/backup-to-neon.sh

if [ -z "${NEON_DATABASE_URL:-}" ]; then
    log "NEON_DATABASE_URL not set; backup service will stay idle"
    exec sleep infinity
fi

BACKUP_HOUR="${BACKUP_HOUR:-3}"
BACKUP_RETRIES="${BACKUP_RETRIES:-5}"
BACKUP_RETRY_DELAY_SECONDS="${BACKUP_RETRY_DELAY_SECONDS:-60}"
BACKUP_HOURLY_RETRY_SECONDS="${BACKUP_HOURLY_RETRY_SECONDS:-3600}"

sleep_until_next_daily_run() {
    now_hour=$(date -u +%H)
    now_min=$(date -u +%M)
    now_sec=$(date -u +%S)
    now_seconds=$((10#$now_hour * 3600 + 10#$now_min * 60 + 10#$now_sec))
    target_seconds=$((BACKUP_HOUR * 3600))

    if [ "$now_seconds" -lt "$target_seconds" ]; then
        wait_seconds=$((target_seconds - now_seconds))
    else
        wait_seconds=$((86400 - now_seconds + target_seconds))
    fi

    log "Next daily backup in ${wait_seconds}s (scheduled ${BACKUP_HOUR}:00 UTC)"
    sleep "$wait_seconds"
}

run_retry_batch() {
    attempt=1
    while [ "$attempt" -le "$BACKUP_RETRIES" ]; do
        log "Backup attempt ${attempt}/${BACKUP_RETRIES}"
        if /usr/local/bin/backup-to-neon.sh; then
            return 0
        fi

        if [ "$attempt" -lt "$BACKUP_RETRIES" ]; then
            log "Backup failed; retrying in ${BACKUP_RETRY_DELAY_SECONDS}s"
            sleep "$BACKUP_RETRY_DELAY_SECONDS"
        fi

        attempt=$((attempt + 1))
    done

    return 1
}

run_daily_backup_cycle() {
    log "Starting daily Neon backup cycle"

    while true; do
        if run_retry_batch; then
            log "Daily Neon backup succeeded"
            return 0
        fi

        log "Backup batch failed after ${BACKUP_RETRIES} attempts; retrying in ${BACKUP_HOURLY_RETRY_SECONDS}s"
        sleep "$BACKUP_HOURLY_RETRY_SECONDS"
    done
}

log "Neon backup service started (daily at ${BACKUP_HOUR}:00 UTC, ${BACKUP_RETRIES} retries per batch, hourly until success)"

while true; do
    sleep_until_next_daily_run
    run_daily_backup_cycle
done
