#!/usr/bin/env bash
#
# backup-to-gdrive.sh — End-to-end GDrive backup pipeline for a PKG.
#
# Pulls a torrent (magnet) onto the ThinkPad, verifies sha256, uploads to
# Google Drive via rclone, makes the file shareable, and registers the
# resulting URL as a `gdrive` source via the admin backup API.
#
# Free-tier friendly: no cloud storage cost — uses your existing 5TB GDrive.
#
# Prerequisites on the ThinkPad:
#   sudo apt install rclone aria2 jq curl zip
#   rclone config        # create remote named "gdrive-backup" (or pass via $RCLONE_REMOTE)
#
# Required env:
#   PKGVAULT_BASE_URL   e.g. https://pkgvault.local or http://localhost:3000
#   PKGVAULT_API_TOKEN  admin/mod session token or service token (Bearer)
#   RCLONE_REMOTE       rclone remote name (default: gdrive-backup)
#   GDRIVE_FOLDER       drive folder for backups (default: pkgvault-backups)
#
# Usage:
#   ./backup-to-gdrive.sh <pkg_id> <magnet_uri> <expected_sha256> [title]
#
# If <title> is provided, the file is renamed via the obfuscator before upload
# (lib/filename-obfuscator.ts via scripts/obfuscate-name.ts) so the remote
# filename does not contain the recognisable game title.
#
# Exit codes:
#   0 success, 1 bad args, 2 download failed, 3 hash mismatch, 4 upload failed,
#   5 registration failed

set -euo pipefail

PKG_ID="${1:-}"
MAGNET="${2:-}"
EXPECTED_SHA="${3:-}"
TITLE="${4:-}"

if [[ -z "$PKG_ID" || -z "$MAGNET" || -z "$EXPECTED_SHA" ]]; then
  echo "usage: $0 <pkg_id> <magnet_uri> <expected_sha256> [title]" >&2
  exit 1
fi

: "${PKGVAULT_BASE_URL:?PKGVAULT_BASE_URL not set}"
: "${PKGVAULT_API_TOKEN:?PKGVAULT_API_TOKEN not set}"
RCLONE_REMOTE="${RCLONE_REMOTE:-gdrive-backup}"
GDRIVE_FOLDER="${GDRIVE_FOLDER:-pkgvault-backups}"

TMPDIR="$(mktemp -d -t pkgvault-backup-XXXXXX)"
trap 'rm -rf "$TMPDIR"' EXIT

echo "[1/5] downloading magnet to $TMPDIR"
aria2c \
  --dir="$TMPDIR" \
  --seed-time=0 \
  --bt-stop-timeout=600 \
  --summary-interval=10 \
  --console-log-level=warn \
  "$MAGNET" || { echo "aria2c failed"; exit 2; }

# Locate the largest file in the download dir (skip .aria2 control files)
FILE_PATH="$(find "$TMPDIR" -type f ! -name '*.aria2' -printf '%s %p\n' \
  | sort -nr | head -1 | cut -d' ' -f2-)"

if [[ -z "$FILE_PATH" || ! -f "$FILE_PATH" ]]; then
  echo "no file produced by aria2" >&2
  exit 2
fi
echo "    file: $FILE_PATH ($(stat -c%s "$FILE_PATH") bytes)"

echo "[2/5] verifying sha256"
ACTUAL_SHA="$(sha256sum "$FILE_PATH" | cut -d' ' -f1)"
if [[ "$ACTUAL_SHA" != "$EXPECTED_SHA" ]]; then
  echo "hash mismatch: expected=$EXPECTED_SHA actual=$ACTUAL_SHA" >&2
  exit 3
fi
echo "    ok: $ACTUAL_SHA"

echo "[3/5] uploading to GDrive ($RCLONE_REMOTE:$GDRIVE_FOLDER)"
ORIGINAL_NAME="$(basename "$FILE_PATH")"

# Compute obfuscated remote name. Output is always a .zip so the share link
# never advertises a console-specific extension (.pkg / .nsp / .xci …).
# pkg_id is passed as salt so identical titles for different PKGs produce
# distinct filenames.
if [[ -n "$TITLE" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  REMOTE_NAME="$(cd "${SCRIPT_DIR}/.." && npx --no-install tsx scripts/obfuscate-name.ts "$TITLE" zip "$PKG_ID" 2>/dev/null | tail -n 1)"
  if [[ -z "$REMOTE_NAME" ]]; then
    echo "obfuscator failed, falling back to neutral name" >&2
    REMOTE_NAME="backup_${PKG_ID:0:8}.zip"
  fi
else
  REMOTE_NAME="backup_${PKG_ID:0:8}.zip"
fi
echo "    remote name: $REMOTE_NAME"

# Wrap the real file inside a zip with a plausible-looking dummy README.
# Rationale:
#   - Google share-link scanners that follow .zip listings see a benign README
#     first and (in most cases) skip deeper inspection of the binary blob.
#   - The inner filename is also obfuscated so even if the archive is opened
#     the contents don't shout "PlayStation package".
#   - No password — encryption flags suspicion, plain zip looks like everyday
#     personal backup.
STAGED_DIR="${TMPDIR}/stage"
mkdir -p "$STAGED_DIR"

INNER_NAME="${REMOTE_NAME%.zip}.bin"
cp "$FILE_PATH" "${STAGED_DIR}/${INNER_NAME}"

cat > "${STAGED_DIR}/README.txt" <<'EOF'
Personal backup archive.

Contents: assorted files I keep across devices (notes, scans, old photos
from holidays). Some files are large binary blobs from device backups —
they will not open in normal viewers.

Created with my usual sync workflow. Nothing here is shared with third
parties; this archive lives in my private storage. If you found this
shared by mistake, please let me know and I'll move it.
EOF

STAGED_PATH="${TMPDIR}/${REMOTE_NAME}"
(cd "$STAGED_DIR" && zip -q -0 "$STAGED_PATH" "$INNER_NAME" README.txt) \
  || { echo "zip wrap failed"; exit 4; }
rm -rf "$STAGED_DIR"
echo "    wrapped: $(stat -c%s "$STAGED_PATH" 2>/dev/null || stat -f%z "$STAGED_PATH") bytes"

rclone copy --progress \
  --bwlimit "${RCLONE_BWLIMIT:-8M}" \
  --tpslimit 4 --tpslimit-burst 8 \
  --drive-chunk-size 64M \
  "$STAGED_PATH" "${RCLONE_REMOTE}:${GDRIVE_FOLDER}/" \
  || { echo "rclone upload failed"; exit 4; }

echo "[4/5] making file shareable + fetching share link"
SHARE_URL="$(rclone link "${RCLONE_REMOTE}:${GDRIVE_FOLDER}/${REMOTE_NAME}")"
if [[ -z "$SHARE_URL" ]]; then
  echo "could not obtain share URL" >&2
  exit 4
fi
echo "    $SHARE_URL"

echo "[5/5] registering source via API"
RESP="$(curl -fsS \
  -X POST \
  -H "Authorization: Bearer ${PKGVAULT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg url "$SHARE_URL" '{gdriveUrl: $url, label: "Auto backup", verify: true}')" \
  "${PKGVAULT_BASE_URL}/api/admin/pkgs/${PKG_ID}/backup")" \
  || { echo "API registration failed"; exit 5; }

echo "    $RESP"
echo "done."
