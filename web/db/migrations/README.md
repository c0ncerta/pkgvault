# DB Migrations

## Applying

For the `add_seeder_counts.sql` migration:

```bash
psql "$DATABASE_URL" -f db/migrations/add_seeder_counts.sql
```

Or push schema via Drizzle (preferred when schema and SQL stay in sync):

```bash
bun run db:push
```

## Health Check Cron

The `/api/cron/health-check` endpoint runs source health checks in bulk.

### 1. Set the secret

Add to `.env`:

```
CRON_SECRET=<long-random-string>
```

### 2. ThinkPad system crontab

Edit crontab on the ThinkPad server:

```bash
crontab -e
```

Add:

```cron
# Every 30 min: re-check sources older than 60 min, up to 25 per run
*/30 * * * * curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" "http://localhost:3000/api/cron/health-check?limit=25&maxAgeMin=60" > /tmp/pkgvault-cron.log 2>&1

# Once a day at 04:00: also recheck dead sources (maybe they came back)
0 4 * * * curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" "http://localhost:3000/api/cron/health-check?limit=200&maxAgeMin=1440&dead=1" >> /tmp/pkgvault-cron.log 2>&1
```

### 3. Verify

Manual run:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3000/api/cron/health-check?limit=5"
```

Response shape:

```json
{
  "checked": 5,
  "results": [
    { "id": "...", "provider": "torrent", "alive": true, "seeders": 12, "leechers": 3, "failCount": 0 }
  ]
}
```

### Dead threshold

Sources auto-flip to `dead` after 5 consecutive failed checks (constant
`DEAD_THRESHOLD_FAILS` in `app/api/cron/health-check/route.ts`).
