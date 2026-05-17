import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { pkgFiles, games, forumThreads, users } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

const getStats = unstable_cache(
  async () => {
    return await Promise.all([
      db.select({
        count: sql<number>`count(*)::int`,
        size: sql<string>`coalesce(sum(${pkgFiles.sizeBytes}), 0)`,
        downloads: sql<number>`coalesce(sum(${pkgFiles.downloadCount}), 0)::int`,
      })
        .from(pkgFiles)
        .where(sql`${pkgFiles.deletedAt} IS NULL AND ${pkgFiles.status} = 'approved'`),
      db.select({ platforms: sql<number>`count(distinct ${games.platform})::int` })
        .from(pkgFiles)
        .innerJoin(games, eq(pkgFiles.gameId, games.id))
        .where(sql`${pkgFiles.deletedAt} IS NULL AND ${pkgFiles.status} = 'approved'`),
      db.select({ count: sql<number>`count(*)::int` }).from(forumThreads).where(sql`${forumThreads.deletedAt} IS NULL`),
      db.select({ count: sql<number>`count(*)::int` }).from(users),
    ]);
  },
  ["home-stats"],
  { revalidate: 300, tags: ["pkgs", "forum", "users"] },
);
import { GlassStat } from "@/components/liquid/glass";

function formatCompact(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

function formatBytes(b: number): string {
  if (b >= 1e12) return `${(b / 1e12).toFixed(1)} TB`;
  if (b >= 1e9) return `${(b / 1e9).toFixed(1)} GB`;
  if (b >= 1e6) return `${(b / 1e6).toFixed(1)} MB`;
  return `${(b / 1e3).toFixed(0)} KB`;
}

export async function HomeStats() {
  let totals = { pkgs: 0, platforms: 0, totalSize: 0, threads: 0, users: 0, downloads: 0 };

  try {
    const [pkgAgg, platformAgg, threadAgg, userAgg] = await getStats();

    totals = {
      pkgs: pkgAgg[0]?.count ?? 0,
      platforms: platformAgg[0]?.platforms ?? 0,
      totalSize: Number(pkgAgg[0]?.size ?? 0),
      threads: threadAgg[0]?.count ?? 0,
      users: userAgg[0]?.count ?? 0,
      downloads: pkgAgg[0]?.downloads ?? 0,
    };
  } catch {
    // DB offline — fall through with zeros
  }

  const stats = [
    { value: formatCompact(totals.pkgs), label: "PKGs" },
    { value: String(totals.platforms), label: "Platforms" },
    { value: formatBytes(totals.totalSize), label: "Archive" },
    { value: formatCompact(totals.downloads), label: "Downloads" },
    { value: formatCompact(totals.threads), label: "Threads" },
    { value: formatCompact(totals.users), label: "Members" },
  ];

  return (
    <section style={{ maxWidth: 900, margin: "72px auto 0", padding: "0 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
        {stats.map((s) => (
          <GlassStat key={s.label} value={s.value} label={s.label} />
        ))}
      </div>
    </section>
  );
}
