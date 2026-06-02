import { GlassCard } from "@/components/liquid/glass";
import { Tag } from "@/components/ui/tag";
import { games, pkgFiles } from "@/db/schema";
import { db } from "@/lib/db";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import Link from "next/link";

interface RelatedPkgsProps {
  pkgId: string;
  gameId?: string | null;
  platform: string | null;
}

function formatBytes(b: bigint | number): string {
  const n = Number(b);
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  return `${(n / 1e3).toFixed(0)} KB`;
}

export async function RelatedPkgs({ pkgId, platform }: RelatedPkgsProps) {
  let related: Array<{
    id: string;
    title: string;
    sizeBytes: bigint;
    downloadCount: number;
    gamePlatform: string | null;
  }> = [];

  try {
    const conditions = [
      eq(pkgFiles.status, "approved"),
      sql`${pkgFiles.deletedAt} IS NULL`,
      ne(pkgFiles.id, pkgId),
    ];
    if (platform) conditions.push(eq(games.platform, platform));

    related = await db
      .select({
        id: pkgFiles.id,
        title: pkgFiles.title,
        sizeBytes: pkgFiles.sizeBytes,
        downloadCount: pkgFiles.downloadCount,
        gamePlatform: games.platform,
      })
      .from(pkgFiles)
      .leftJoin(games, eq(pkgFiles.gameId, games.id))
      .where(and(...conditions))
      .orderBy(desc(pkgFiles.downloadCount))
      .limit(4);
  } catch {
    // DB offline
  }

  if (related.length === 0) return null;

  return (
    <section style={{ marginTop: "var(--space-32)" }}>
      <div style={{ marginBottom: "var(--space-16)" }}>
        <div
          style={{
            fontSize: "var(--fs-xs)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--color-accent-hover)",
            fontWeight: 600,
            marginBottom: "var(--space-4)",
          }}
        >
          Related
        </div>
        <h2
          style={{
            fontSize: "var(--fs-2xl)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--color-text-primary)",
          }}
        >
          {platform ? `More on ${platform}` : "You might also like"}
        </h2>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "var(--space-12)",
        }}
      >
        {related.map((r, i) => (
          <Link
            key={r.id}
            href={`/catalog/${r.id}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <GlassCard
              padding="0"
              style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
            >
              <div
                style={{
                  height: 86,
                  background: `linear-gradient(135deg,
                  hsl(${(i * 67) % 360}, 50%, 45%),
                  hsl(${(i * 67 + 40) % 360}, 50%, 30%))`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--fs-3xl)",
                    fontWeight: 900,
                    color: "rgba(255,255,255,0.85)",
                    letterSpacing: "-0.04em",
                  }}
                >
                  {r.title.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div
                style={{
                  padding: "var(--space-12)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-6)",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--fs-base)",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.title}
                </span>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "var(--fs-xs)",
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <span>{formatBytes(r.sizeBytes)}</span>
                  <span>↓ {r.downloadCount}</span>
                </div>
                {r.gamePlatform && <Tag>{r.gamePlatform}</Tag>}
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
