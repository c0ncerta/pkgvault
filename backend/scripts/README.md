# PKGVault Scripts

## `backup-to-gdrive.sh` — GDrive backup pipeline

End-to-end mirroring: magnet → ThinkPad → sha256 verify → GDrive → API source registration.

### Install prerequisites (one-off, on the ThinkPad)

```bash
sudo apt update
sudo apt install -y rclone aria2 jq curl
```

### Configure rclone

```bash
rclone config
# n) New remote
# name: gdrive-backup
# storage: drive
# scope: drive
# (browser auth — paste the URL into a browser on a machine with display)
```

Use a **separate Google account** (not your main one), since piracy DMCA risk
applies to whichever account hosts the file.

### Set env

Add to `~/.profile` or a systemd EnvironmentFile:

```bash
export PKGVAULT_BASE_URL="https://pkgvault.local"
export PKGVAULT_API_TOKEN="<paste admin session token or service token>"
export RCLONE_REMOTE="gdrive-backup"
export GDRIVE_FOLDER="pkgvault-backups"
```

### Manual run

```bash
./scripts/backup-to-gdrive.sh \
  <pkg-uuid> \
  "magnet:?xt=urn:btih:..." \
  <expected-sha256>
```

The script:

1. Downloads the magnet via `aria2c` to a tempdir (no seeding past completion).
2. Verifies the file's sha256 against the expected hash. Aborts on mismatch.
3. Uploads via `rclone copy` to `gdrive-backup:pkgvault-backups/`.
4. Calls `rclone link` to obtain a shareable URL.
5. POSTs to `/api/admin/pkgs/<id>/backup` to register the gdrive source.

Tempdir is cleaned up on exit (success or failure).

### Driving it from the admin UI / queue

The script is invoked manually for now. Two routes you can use to pick targets:

```bash
# Pkgs needing backup (no gdrive mirror, or torrent dead with no seeders)
curl -H "Authorization: Bearer $PKGVAULT_API_TOKEN" \
  "$PKGVAULT_BASE_URL/api/admin/backup-candidates?limit=20&missingOnly=1"
```

Pipe candidates into `xargs` + the script for batch runs once you trust it.

### Disk budget

The ThinkPad needs free space equal to **one PKG at a time** during transit
(default tempdir under `/tmp`). For 50 GB pkgs, ensure `/tmp` (or `TMPDIR`)
has that much space, or override:

```bash
TMPDIR=/mnt/data/tmp ./scripts/backup-to-gdrive.sh ...
```
