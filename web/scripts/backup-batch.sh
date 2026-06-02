#!/usr/bin/env bash
#
# backup-batch.sh — Rate-limited GDrive backup queue runner.
#
# Reads a TSV queue file with backup jobs and runs them with jittered delays
# so the upload pattern looks like a real human syncing, not a scripted dump.
# Designed to coexist with naive Google abuse heuristics (mass upload bursts).
#
# Queue file format (one job per line, tab-separated):
#   <pkg_id>\t<magnet_uri>\t<expected_sha256>\t<title>
#
# Empty lines and lines starting with "#" are ignored.
#
# Required env (same as backup-to-gdrive.sh):
#   PKGVAULT_BASE_URL
#   PKGVAULT_API_TOKEN
#   RCLONE_REMOTE          (default: gdrive-backup)
#   GDRIVE_FOLDER          (default: pkgvault-backups)
#
# Optional env (rate limiting):
#   MIN_SLEEP_SEC=900      lower bound between jobs (default 15 min)
#   MAX_SLEEP_SEC=3600     upper bound between jobs (default 60 min)
#   MAX_PER_DAY=8          stop after N successful uploads in 24h (default 8)
#   QUIET_HOURS_START=2    UTC hour to start quiet window (default 02)
#   QUIET_HOURS_END=7      UTC hour to end quiet window (default 07)
#   STATE_FILE=~/.cache/pkgvault-backup-state
#
# Usage:
#   ./backup-batch.sh <queue.tsv>
#
# Notes:
#   - Sleep window is randomised inside [MIN_SLEEP_SEC, MAX_SLEEP_SEC] to
#     break uniform-cadence detection.
#   - During the quiet window the script pauses entirely (mimics user asleep).
#   - State file tracks today's upload count so MAX_PER_DAY survives restarts.

set -euo pipefail

QUEUE="${1:-}"
if [[ -z "$QUEUE" || ! -f "$QUEUE" ]]; then
  echo "usage: $0 <queue.tsv>" >&2
  exit 1
fi

: "${PKGVAULT_BASE_URL:?PKGVAULT_BASE_URL not set}"
: "${PKGVAULT_API_TOKEN:?PKGVAULT_API_TOKEN not set}"

MIN_SLEEP_SEC="${MIN_SLEEP_SEC:-900}"
MAX_SLEEP_SEC="${MAX_SLEEP_SEC:-3600}"
MAX_PER_DAY="${MAX_PER_DAY:-8}"
QUIET_HOURS_START="${QUIET_HOURS_START:-2}"
QUIET_HOURS_END="${QUIET_HOURS_END:-7}"
STATE_FILE="${STATE_FILE:-$HOME/.cache/pkgvault-backup-state}"

mkdir -p "$(dirname "$STATE_FILE")"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# State file format:
#   YYYY-MM-DD <count>
read_state() {
  if [[ -f "$STATE_FILE" ]]; then
    cat "$STATE_FILE"
  else
    echo "1970-01-01 0"
  fi
}

write_state() {
  echo "$1 $2" > "$STATE_FILE"
}

today_count() {
  local today
  today="$(date -u +%F)"
  local line date count
  line="$(read_state)"
  date="$(echo "$line" | cut -d' ' -f1)"
  count="$(echo "$line" | cut -d' ' -f2)"
  if [[ "$date" != "$today" ]]; then
    write_state "$today" 0
    echo 0
  else
    echo "$count"
  fi
}

bump_count() {
  local today current
  today="$(date -u +%F)"
  current="$(today_count)"
  write_state "$today" $((current + 1))
}

random_between() {
  local min="$1" max="$2"
  echo $(( min + RANDOM % (max - min + 1) ))
}

in_quiet_hours() {
  local h
  h=$(date -u +%-H)
  if [[ "$QUIET_HOURS_START" -lt "$QUIET_HOURS_END" ]]; then
    [[ "$h" -ge "$QUIET_HOURS_START" && "$h" -lt "$QUIET_HOURS_END" ]]
  else
    # Wraps midnight
    [[ "$h" -ge "$QUIET_HOURS_START" || "$h" -lt "$QUIET_HOURS_END" ]]
  fi
}

wait_for_active_window() {
  while in_quiet_hours; do
    echo "[batch] quiet hours (UTC $(date -u +%H:%M)), sleeping 30 min" >&2
    sleep 1800
  done
}

job_count=0
while IFS=$'\t' read -r PKG_ID MAGNET SHA TITLE || [[ -n "$PKG_ID" ]]; do
  # Skip blanks/comments
  [[ -z "$PKG_ID" || "${PKG_ID:0:1}" == "#" ]] && continue
  if [[ -z "$MAGNET" || -z "$SHA" ]]; then
    echo "[batch] malformed line, skipping: pkg=$PKG_ID" >&2
    continue
  fi

  # Daily cap
  current_count="$(today_count)"
  if [[ "$current_count" -ge "$MAX_PER_DAY" ]]; then
    echo "[batch] daily cap reached ($current_count/$MAX_PER_DAY), sleeping until tomorrow" >&2
    # Sleep until next UTC midnight + small jitter
    now_epoch=$(date -u +%s)
    tomorrow_epoch=$(date -u -d "tomorrow 00:00" +%s 2>/dev/null \
      || date -u -v+1d -v0H -v0M -v0S +%s)
    sleep $((tomorrow_epoch - now_epoch + RANDOM % 1800))
  fi

  wait_for_active_window

  job_count=$((job_count + 1))
  echo "[batch] job $job_count: pkg=$PKG_ID title=\"$TITLE\""

  if "$SCRIPT_DIR/backup-to-gdrive.sh" "$PKG_ID" "$MAGNET" "$SHA" "$TITLE"; then
    bump_count
    echo "[batch] success pkg=$PKG_ID (today=$(today_count)/$MAX_PER_DAY)"
  else
    echo "[batch] FAILED pkg=$PKG_ID — continuing" >&2
  fi

  sleep_sec="$(random_between "$MIN_SLEEP_SEC" "$MAX_SLEEP_SEC")"
  echo "[batch] sleeping ${sleep_sec}s before next job"
  sleep "$sleep_sec"
done < "$QUEUE"

echo "[batch] queue drained ($job_count jobs processed)"
