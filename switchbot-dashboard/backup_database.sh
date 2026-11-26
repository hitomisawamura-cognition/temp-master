#!/bin/bash

# Temp Master Dashboard Database Backup Script
# This script periodically downloads the SQLite database from the deployed backend
# for local backup purposes.
#
# Usage:
#   ./backup_database.sh                    # Run once
#   ./backup_database.sh --loop             # Run continuously every hour
#   ./backup_database.sh --loop --interval 1800  # Run every 30 minutes (1800 seconds)
#
# Configuration:
#   Set SWITCHBOT_BACKEND_URL environment variable or edit the default below
#   Set BACKUP_DIR environment variable to change the backup directory
#   Set BACKUP_API_KEY to the backend's API_KEY

BACKEND_URL="${SWITCHBOT_BACKEND_URL:-https://temp-master.fly.dev}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/switchbot_backups}"
BACKUP_API_KEY="${BACKUP_API_KEY:-}"
export -n BACKUP_API_KEY
DEFAULT_INTERVAL=3600  # 1 hour in seconds

LOOP_MODE=false
INTERVAL=$DEFAULT_INTERVAL

while [[ $# -gt 0 ]]; do
    case $1 in
        --loop)
            LOOP_MODE=true
            shift
            ;;
        --interval)
            INTERVAL="$2"
            shift 2
            ;;
        --help)
            echo "SwitchBot Dashboard Database Backup Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --loop              Run continuously instead of once"
            echo "  --interval SECONDS  Interval between backups in loop mode (default: 3600)"
            echo "  --help              Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  SWITCHBOT_BACKEND_URL  Backend URL (default: https://temp-master.fly.dev)"
            echo "  BACKUP_DIR             Backup directory (default: ~/switchbot_backups)"
            echo "  BACKUP_API_KEY         Required: backend API key (sent as X-API-Key)"
            echo "  BACKUP_ALLOW_INSECURE_HTTP=1  Allow sending the key over HTTP to non-local hosts (unsafe)"
            echo "  Requires curl 7.55.0 or later and file."
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

if [[ -z "$BACKUP_API_KEY" ]]; then
    echo "BACKUP_API_KEY must be set" >&2
    exit 1
fi
if [[ "$BACKUP_API_KEY" == *$'\r'* || "$BACKUP_API_KEY" == *$'\n'* ]]; then
    echo "BACKUP_API_KEY must not contain line breaks" >&2
    exit 1
fi
curl_proxy_options=()
if [[ "$BACKEND_URL" == http://* ]]; then
    if [[ "$BACKEND_URL" =~ ^http://(localhost|127\.0\.0\.1)(:[0-9]+)?(/|$) ]]; then
        curl_proxy_options=(--noproxy '*')
    elif [[ "${BACKUP_ALLOW_INSECURE_HTTP:-}" != 1 ]]; then
        echo "Refusing to send the API key over non-local HTTP. Use HTTPS or explicitly set BACKUP_ALLOW_INSECURE_HTTP=1." >&2
        exit 1
    fi
elif [[ "$BACKEND_URL" != https://* ]]; then
    echo "SWITCHBOT_BACKEND_URL must start with https:// or http://" >&2
    exit 1
fi
if ! command -v file >/dev/null; then
    echo "The file command is required to validate SQLite backups" >&2
    exit 1
fi
mkdir -p "$BACKUP_DIR" || exit 1

backup_database() {
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/switchbot_backup_${timestamp}.db"
    local download_file http_code
    download_file=$(mktemp "$BACKUP_DIR/.switchbot_backup_XXXXXX") || return 1
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup..."
    
    if ! http_code=$(printf 'X-API-Key: %s\n' "$BACKUP_API_KEY" |
        curl -q --globoff --proto '=http,https' "${curl_proxy_options[@]}" \
            -sS -w "%{http_code}" -o "$download_file" -H @- "$BACKEND_URL/api/backup"); then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup download failed" >&2
    elif [[ "$http_code" != 200 ]]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup failed with HTTP status: $http_code" >&2
    elif [[ ! -s "$download_file" || "$(LC_ALL=C file -b "$download_file")" != "SQLite 3.x database"* ]]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup failed: empty or invalid SQLite file" >&2
    elif mv -- "$download_file" "$backup_file"; then
        local file_size=$(ls -lh "$backup_file" | awk '{print $5}')
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup successful: $backup_file ($file_size)"
        
        # Keep only the last 30 backups to prevent disk space issues
        local backup_count=$(ls -1 "$BACKUP_DIR"/switchbot_backup_*.db 2>/dev/null | wc -l)
        if [ "$backup_count" -gt 30 ]; then
            local files_to_delete=$((backup_count - 30))
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cleaning up $files_to_delete old backup(s)..."
            ls -1t "$BACKUP_DIR"/switchbot_backup_*.db | tail -n "$files_to_delete" | xargs rm -f
        fi
        
        return 0
    fi
    rm -f -- "$download_file"
    return 1
}

echo "Temp Master Dashboard Database Backup"
echo "====================================="
echo "Backend URL: $BACKEND_URL"
echo "Backup directory: $BACKUP_DIR"
echo ""

if [ "$LOOP_MODE" = true ]; then
    echo "Running in loop mode with ${INTERVAL}s interval"
    echo "Press Ctrl+C to stop"
    echo ""
    
    while true; do
        backup_database
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Next backup in ${INTERVAL} seconds..."
        sleep "$INTERVAL"
    done
else
    backup_database
fi
