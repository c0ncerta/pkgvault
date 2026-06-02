import { pkgFiles, pkgSources } from "@/db/schema";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { and, eq, isNull, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/backup-candidates
 *
 * Returns PKGs that should be prioritised for GDrive backup:
 *   - approved status
 *   - either: no gdrive source at all
 *   - or: torrent source is dead / has zero seeders
 *
 * Sorted by download_count desc (popular first), then size asc (small first).
 *
 * Query:
 *   - limit (default 50, max 200)
 *   - missingOnly: "1" to only include pkgs with no gdrive backup
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "mod") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const limit = Math.min(Number.parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 200);
  const missingOnly = url.searchParams.get("missingOnly") === "1";

  // Subquery aggregations per pkg:
  //   hasGdrive: bool — any gdrive source exists
  //   torrentDead: bool — has a torrent source but all are dead OR have 0 seeders
  const torrentAggSubquery = db
    .select({
      pkgId: pkgSources.pkgId,
      totalTorrent: sql<number>`count(*) filter (where ${pkgSources.provider} = 'torrent')`.as(
        "total_torrent",
      ),
      aliveTorrent:
        sql<number>`count(*) filter (where ${pkgSources.provider} = 'torrent' and ${pkgSources.status} = 'alive' and ${pkgSources.seederCount} > 0)`.as(
          "alive_torrent",
        ),
      hasGdrive: sql<boolean>`bool_or(${pkgSources.provider} = 'gdrive')`.as("has_gdrive"),
    })
    .from(pkgSources)
    .groupBy(pkgSources.pkgId)
    .as("src_agg");

  const rows = await db
    .select({
      id: pkgFiles.id,
      title: pkgFiles.title,
      version: pkgFiles.version,
      sizeBytes: pkgFiles.sizeBytes,
      downloadCount: pkgFiles.downloadCount,
      sha256: pkgFiles.sha256,
      hasGdrive: torrentAggSubquery.hasGdrive,
      totalTorrent: torrentAggSubquery.totalTorrent,
      aliveTorrent: torrentAggSubquery.aliveTorrent,
    })
    .from(pkgFiles)
    .leftJoin(torrentAggSubquery, eq(torrentAggSubquery.pkgId, pkgFiles.id))
    .where(
      and(
        eq(pkgFiles.status, "approved"),
        isNull(pkgFiles.deletedAt),
        missingOnly
          ? sql`coalesce(${torrentAggSubquery.hasGdrive}, false) = false`
          : sql`coalesce(${torrentAggSubquery.hasGdrive}, false) = false
                OR (coalesce(${torrentAggSubquery.totalTorrent}, 0) > 0
                    AND coalesce(${torrentAggSubquery.aliveTorrent}, 0) = 0)`,
      ),
    )
    .orderBy(sql`${pkgFiles.downloadCount} desc, ${pkgFiles.sizeBytes} asc`)
    .limit(limit);

  return NextResponse.json({
    count: rows.length,
    candidates: rows.map((r) => ({
      id: r.id,
      title: r.title,
      version: r.version,
      sizeBytes: String(r.sizeBytes),
      downloadCount: r.downloadCount,
      sha256: r.sha256,
      hasGdrive: r.hasGdrive ?? false,
      torrentDead: (r.totalTorrent ?? 0) > 0 && (r.aliveTorrent ?? 0) === 0,
      reason: !r.hasGdrive ? "no-gdrive-backup" : "torrent-dead",
    })),
  });
}
