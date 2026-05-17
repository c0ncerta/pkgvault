import { pkgSources } from "@/db/schema";
import { db } from "@/lib/db";
import { checkSourceHealth } from "@/lib/health-check";
import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cron/health-check
 *
 * Bulk health check for stale sources. Designed to be hit by an external cron
 * (system crontab on the ThinkPad, or any HTTP cron service).
 *
 * Auth: header `Authorization: Bearer <CRON_SECRET>` OR query `?secret=<CRON_SECRET>`.
 *
 * Query params:
 *   - limit:    max sources to check this run (default 25, max 200)
 *   - maxAgeMin: only re-check sources whose lastCheckedAt is older than N minutes
 *                (default 60). Sources never checked are always included.
 *   - dead:     "1" to include sources already marked dead (default skips them)
 *   - sourceId: check a single source id (debugging)
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const DEAD_THRESHOLD_FAILS = 5;

export async function GET(request: NextRequest) {
  const secret = process.env["CRON_SECRET"];
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const url = new URL(request.url);
  const provided = authHeader.replace(/^Bearer\s+/i, "") || url.searchParams.get("secret") || "";
  if (provided !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limit = Math.min(Number.parseInt(url.searchParams.get("limit") ?? "25", 10) || 25, 200);
  const maxAgeMin = Number.parseInt(url.searchParams.get("maxAgeMin") ?? "60", 10) || 60;
  const includeDead = url.searchParams.get("dead") === "1";
  const singleId = url.searchParams.get("sourceId");

  const staleBefore = new Date(Date.now() - maxAgeMin * 60_000);

  const stale = singleId
    ? await db.select().from(pkgSources).where(eq(pkgSources.id, singleId)).limit(1)
    : await db
        .select()
        .from(pkgSources)
        .where(
          and(
            includeDead ? sql`true` : sql`${pkgSources.status} != 'dead'`,
            or(isNull(pkgSources.lastCheckedAt), lt(pkgSources.lastCheckedAt, staleBefore)),
          ),
        )
        .limit(limit);

  const results: Array<{
    id: string;
    provider: string;
    alive: boolean;
    seeders: number;
    leechers: number;
    failCount: number;
  }> = [];

  // Sequential to avoid hammering trackers; could chunk-parallelize later.
  for (const source of stale) {
    const result = await checkSourceHealth({
      provider: source.provider,
      url: source.url,
    });

    const newFailCount = result.alive ? 0 : source.failCount + 1;
    const now = new Date();

    await db
      .update(pkgSources)
      .set({
        status: result.alive ? "alive" : newFailCount >= DEAD_THRESHOLD_FAILS ? "dead" : "unknown",
        lastCheckedAt: now,
        lastAliveAt: result.alive ? now : source.lastAliveAt,
        failCount: newFailCount,
        seederCount: result.seederCount,
        leecherCount: result.leecherCount,
        updatedAt: now,
      })
      .where(eq(pkgSources.id, source.id));

    results.push({
      id: source.id,
      provider: source.provider,
      alive: result.alive,
      seeders: result.seederCount,
      leechers: result.leecherCount,
      failCount: newFailCount,
    });
  }

  return NextResponse.json({
    checked: results.length,
    results,
  });
}
