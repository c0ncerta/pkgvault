import Link from "next/link";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { games, pkgFiles } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

const getTrendingTags = unstable_cache(
  async () => {
    return await Promise.all([
      db.select({
        platform: games.platform,
        count: sql<number>`count(${pkgFiles.id})::int`,
      })
        .from(pkgFiles)
        .innerJoin(games, eq(pkgFiles.gameId, games.id))
        .where(sql`${pkgFiles.deletedAt} IS NULL AND ${pkgFiles.status} = 'approved' AND ${games.platform} IS NOT NULL`)
        .groupBy(games.platform)
        .orderBy(desc(sql`count(${pkgFiles.id})`))
        .limit(8),
      db.select({
        region: games.region,
        count: sql<number>`count(${pkgFiles.id})::int`,
      })
        .from(pkgFiles)
        .innerJoin(games, eq(pkgFiles.gameId, games.id))
        .where(sql`${pkgFiles.deletedAt} IS NULL AND ${pkgFiles.status} = 'approved' AND ${games.region} IS NOT NULL`)
        .groupBy(games.region)
        .orderBy(desc(sql`count(${pkgFiles.id})`))
        .limit(6),
    ]);
  },
  ["home-trending-tags"],
  { revalidate: 300, tags: ["pkgs"] },
);
import { GlassCard } from "@/components/liquid/glass";

export async function HomeTrendingTags() {
  let rawPlatforms: Array<{ platform: string | null; count: number }> = [];
  let rawRegions: Array<{ region: string | null; count: number }> = [];

  try {
    [rawPlatforms, rawRegions] = await getTrendingTags();
  } catch {
    // DB offline
  }

  const platforms = rawPlatforms.filter((p): p is { platform: string; count: number } => p.platform !== null);
  const regions = rawRegions.filter((r): r is { region: string; count: number } => r.region !== null);
  const max = Math.max(1, ...platforms.map((p) => p.count));

  return (
    <GlassCard padding="22px 24px" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
        Browse by tag
      </h3>

      {platforms.length > 0 && (
        <div>
          <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: 8 }}>
            Platforms
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {platforms.map((p) => {
              const size = 0.75 + (p.count / max) * 0.35;
              return (
                <Link
                  key={p.platform}
                  href={`/catalog?platform=${encodeURIComponent(p.platform)}`}
                  style={{
                    padding: "5px 11px", borderRadius: 999,
                    background: "rgba(99, 102, 241, 0.08)",
                    border: "1px solid rgba(99, 102, 241, 0.15)",
                    color: "var(--color-text-primary)",
                    fontSize: `${size}rem`, fontWeight: 500,
                    textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                >
                  {p.platform}
                  <span style={{ marginLeft: 6, fontSize: "0.65rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                    {p.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {regions.length > 0 && (
        <div>
          <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: 8 }}>
            Regions
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {regions.map((r) => (
              <Link
                key={r.region}
                href={`/catalog?q=${encodeURIComponent(r.region)}`}
                style={{
                  padding: "4px 10px", borderRadius: 999,
                  background: "rgba(139, 92, 246, 0.06)",
                  border: "1px solid rgba(139, 92, 246, 0.12)",
                  color: "var(--color-text-secondary)",
                  fontSize: "0.75rem",
                  textDecoration: "none",
                }}
              >
                {r.region} <span style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>{r.count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
