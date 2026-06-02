import { GlassStat } from "@/components/liquid/glass";
import { CountUp } from "@/components/ui/count-up";
import { forumThreads, games, pkgFiles, users } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

const getStats = unstable_cache(
  async () => {
    return await Promise.all([
      db
        .select({
          count: sql<number>`count(*)::int`,
          size: sql<string>`coalesce(sum(${pkgFiles.sizeBytes}), 0)`,
          downloads: sql<number>`coalesce(sum(${pkgFiles.downloadCount}), 0)::int`,
        })
        .from(pkgFiles)
        .where(sql`${pkgFiles.deletedAt} IS NULL AND ${pkgFiles.status} = 'approved'`),
      db
        .select({ platforms: sql<number>`count(distinct ${games.platform})::int` })
        .from(pkgFiles)
        .innerJoin(games, eq(pkgFiles.gameId, games.id))
        .where(sql`${pkgFiles.deletedAt} IS NULL AND ${pkgFiles.status} = 'approved'`),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(forumThreads)
        .where(sql`${forumThreads.deletedAt} IS NULL`),
      db.select({ count: sql<number>`count(*)::int` }).from(users),
    ]);
  },
  ["home-stats"],
  { revalidate: 300, tags: ["pkgs", "forum", "users"] },
);

function parseCompact(n: number) {
  if (n >= 1e9) return { end: n / 1e9, decimals: 1, suffix: "B" };
  if (n >= 1e6) return { end: n / 1e6, decimals: 1, suffix: "M" };
  if (n >= 1e3) return { end: n / 1e3, decimals: 1, suffix: "K" };
  return { end: n, decimals: 0, suffix: "" };
}

function parseBytes(b: number) {
  if (b >= 1e12) return { end: b / 1e12, decimals: 1, suffix: " TB" };
  if (b >= 1e9) return { end: b / 1e9, decimals: 1, suffix: " GB" };
  if (b >= 1e6) return { end: b / 1e6, decimals: 1, suffix: " MB" };
  return { end: b / 1e3, decimals: 0, suffix: " KB" };
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
    { ...parseCompact(totals.pkgs), label: "PKGs" },
    { end: totals.platforms, decimals: 0, suffix: "", label: "Platforms" },
    { ...parseBytes(totals.totalSize), label: "Archive" },
    { ...parseCompact(totals.downloads), label: "Downloads" },
    { ...parseCompact(totals.threads), label: "Threads" },
    { ...parseCompact(totals.users), label: "Members" },
  ];

  return (
    <section style={{ maxWidth: 1100, margin: "72px auto 0", padding: "0 24px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 10,
        }}
      >
        {stats.map((s) => (
          <GlassStat
            key={s.label}
            value={<CountUp end={s.end} decimals={s.decimals} suffix={s.suffix} />}
            label={s.label}
          />
        ))}
      </div>
    </section>
  );
}
