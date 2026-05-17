import Link from "next/link";
import { IconFire } from "@/components/ui/icons";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { pkgFiles, games } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

const getFeatured = unstable_cache(
  async () => {
    return await db
      .select({
        id: pkgFiles.id,
        title: pkgFiles.title,
        sizeBytes: pkgFiles.sizeBytes,
        downloadCount: pkgFiles.downloadCount,
        version: pkgFiles.version,
        gamePlatform: games.platform,
        gameRegion: games.region,
        createdAt: pkgFiles.createdAt,
      })
      .from(pkgFiles)
      .leftJoin(games, eq(pkgFiles.gameId, games.id))
      .where(and(eq(pkgFiles.status, "approved"), sql`${pkgFiles.deletedAt} IS NULL`))
      .orderBy(desc(pkgFiles.downloadCount))
      .limit(6);
  },
  ["home-featured-pkgs"],
  { revalidate: 60, tags: ["pkgs"] },
);
import { GlassCard } from "@/components/liquid/glass";
import { Tag } from "@/components/ui/tag";

function formatBytes(b: bigint | number): string {
  const n = Number(b);
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  return `${(n / 1e3).toFixed(0)} KB`;
}

export async function HomeFeaturedPkgs() {
  let items: Array<{
    id: string; title: string; sizeBytes: bigint;
    downloadCount: number; version: string | null;
    gamePlatform: string | null; gameRegion: string | null;
    createdAt: Date;
  }> = [];

  try {
    items = await getFeatured();
  } catch {
    // DB offline
  }

  if (items.length === 0) return null;

  return (
    <section style={{ maxWidth: 1100, margin: "96px auto 0", padding: "0 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-accent-hover)", fontWeight: 600, marginBottom: 4 }}>
            Featured
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
            Most-downloaded packages
          </h2>
        </div>
        <Link href="/catalog" className="btn-ghost" style={{ fontSize: "0.85rem" }}>
          Browse all →
        </Link>
      </div>

      <div className="responsive-grid-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {items.map((it, i) => (
          <Link key={it.id} href={`/catalog/${it.id}`} className={`animate-slide-up delay-${Math.min(i + 1, 6)}`} style={{ textDecoration: "none", display: "block" }}>
            <GlassCard variant={i === 0 ? "elevated" : "content"} padding="0" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{
                height: 120, position: "relative",
                background: `linear-gradient(135deg,
                  hsl(${(i * 53) % 360}, 60%, 50%) 0%,
                  hsl(${(i * 53 + 40) % 360}, 60%, 35%) 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}>
                <span style={{
                  fontSize: "2.4rem", fontWeight: 900, color: "rgba(255,255,255,0.85)",
                  textShadow: "0 2px 12px rgba(0,0,0,0.25)", letterSpacing: "-0.04em",
                }}>
                  {it.title.slice(0, 2).toUpperCase()}
                </span>
                {i === 0 && (
                  <span style={{
                    position: "absolute", top: 10, right: 10,
                    background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)",
                    padding: "3px 9px", borderRadius: 999, fontSize: "0.65rem",
                    fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>
                    <IconFire size={12} style={{ display: "inline" }} /> #1
                  </span>
                )}
              </div>
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.3 }}>
                  {it.title}
                </span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {it.gamePlatform && <Tag>{it.gamePlatform}</Tag>}
                  {it.gameRegion && <Tag>{it.gameRegion}</Tag>}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 8 }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                    {formatBytes(it.sizeBytes)}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                    ↓ {it.downloadCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
