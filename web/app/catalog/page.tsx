import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/liquid/glass";
import { IconCatalog, IconCheck, IconFire, IconQueue } from "@/components/ui/icons";
import { Tag } from "@/components/ui/tag";
import { games, pkgFiles } from "@/db/schema";
import { db } from "@/lib/db";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { CatalogFilters } from "./catalog-filters";

export const metadata: Metadata = {
  title: "Catalog",
  description: "Browse the PKGVault community archive — verified game packages",
};

function formatBytes(bytes: bigint | number): string {
  const num = Number(bytes);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} GB`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} MB`;
  return `${(num / 1_000).toFixed(0)} KB`;
}

interface CatalogPageProps {
  searchParams: Promise<{ q?: string; platform?: string; sort?: string; page?: string }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const platform = params.platform ?? "";
  const sort = params.sort ?? "newest";
  const page = Math.max(1, Number(params.page) || 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  let items: Array<{
    id: string;
    title: string;
    description: string | null;
    sha256: string;
    sizeBytes: bigint;
    version: string | null;
    fwRequired: string | null;
    downloadCount: number;
    createdAt: Date;
    gameTitle: string | null;
    gamePlatform: string | null;
    gameRegion: string | null;
    gameCoverUrl: string | null;
  }> = [];
  let total = 0;
  let statsData = { totalPkgs: 0, platforms: 0, totalSize: "0", verified: 0, pending: 0 };
  let platformCounts: Array<{ value: string; count: number }> = [];
  let regionCounts: Array<{ value: string; count: number }> = [];

  try {
    const conditions = [eq(pkgFiles.status, "approved"), sql`${pkgFiles.deletedAt} IS NULL`];

    if (q) {
      conditions.push(
        sql`to_tsvector('english', ${pkgFiles.title} || ' ' || coalesce(${pkgFiles.description}, '')) @@ plainto_tsquery('english', ${q})`,
      );
    }

    const orderBy =
      sort === "oldest"
        ? asc(pkgFiles.createdAt)
        : sort === "downloads"
          ? desc(pkgFiles.downloadCount)
          : sort === "title"
            ? asc(pkgFiles.title)
            : desc(pkgFiles.createdAt);

    const where = and(...conditions);

    const [data, countResult, statsResult, platformAgg, regionAgg] = await Promise.all([
      db
        .select({
          id: pkgFiles.id,
          title: pkgFiles.title,
          description: pkgFiles.description,
          sha256: pkgFiles.sha256,
          sizeBytes: pkgFiles.sizeBytes,
          version: pkgFiles.version,
          fwRequired: pkgFiles.fwRequired,
          downloadCount: pkgFiles.downloadCount,
          createdAt: pkgFiles.createdAt,
          gameTitle: games.title,
          gamePlatform: games.platform,
          gameRegion: games.region,
          gameCoverUrl: games.coverUrl,
        })
        .from(pkgFiles)
        .leftJoin(games, eq(pkgFiles.gameId, games.id))
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(pkgFiles).where(where),
      db
        .select({
          totalPkgs: sql<number>`count(*)`,
          verified: sql<number>`count(*) filter (where ${pkgFiles.sha256} != 'pending')`,
          pending: sql<number>`count(*) filter (where ${pkgFiles.status} = 'pending')`,
          totalSize: sql<string>`coalesce(sum(${pkgFiles.sizeBytes}), 0)`,
          platforms: sql<number>`count(distinct ${games.platform})`,
        })
        .from(pkgFiles)
        .leftJoin(games, eq(pkgFiles.gameId, games.id))
        .where(sql`${pkgFiles.deletedAt} IS NULL`),
      db
        .select({
          value: games.platform,
          count: sql<number>`count(${pkgFiles.id})::int`,
        })
        .from(pkgFiles)
        .innerJoin(games, eq(pkgFiles.gameId, games.id))
        .where(
          sql`${pkgFiles.deletedAt} IS NULL AND ${pkgFiles.status} = 'approved' AND ${games.platform} IS NOT NULL`,
        )
        .groupBy(games.platform)
        .orderBy(sql`count(${pkgFiles.id}) desc`),
      db
        .select({
          value: games.region,
          count: sql<number>`count(${pkgFiles.id})::int`,
        })
        .from(pkgFiles)
        .innerJoin(games, eq(pkgFiles.gameId, games.id))
        .where(
          sql`${pkgFiles.deletedAt} IS NULL AND ${pkgFiles.status} = 'approved' AND ${games.region} IS NOT NULL`,
        )
        .groupBy(games.region)
        .orderBy(sql`count(${pkgFiles.id}) desc`),
    ]);
    platformCounts = platformAgg.filter(
      (p): p is { value: string; count: number } => p.value !== null,
    );
    regionCounts = regionAgg.filter((r): r is { value: string; count: number } => r.value !== null);

    items = data;
    total = countResult[0]?.count ?? 0;
    if (statsResult[0]) {
      statsData = {
        totalPkgs: statsResult[0].totalPkgs,
        platforms: statsResult[0].platforms,
        totalSize: formatBytes(BigInt(statsResult[0].totalSize)),
        verified: statsResult[0].verified,
        pending: statsResult[0].pending,
      };
    }
  } catch {
    // DB not available — show empty state
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Navbar />
      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "32px 24px 64px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="animate-fade-in"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "var(--space-12)",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "var(--fs-5xl)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-4)",
              }}
            >
              Public Catalog
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--fs-lg)" }}>
              Community archive — every package manually reviewed before publishing.
            </p>
          </div>
          <Link href="/upload" className="btn-primary">
            ＋ Upload PKG
          </Link>
        </div>

        {/* Stats strip */}
        <div
          className="animate-fade-in delay-1 responsive-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "var(--space-12)",
            marginBottom: "var(--space-24)",
          }}
        >
          {[
            { v: String(statsData.totalPkgs), l: "PKGs" },
            { v: String(statsData.platforms), l: "Platforms" },
            { v: statsData.totalSize || "0 B", l: "Total size" },
            { v: String(statsData.verified), l: "Verified" },
            { v: String(statsData.pending), l: "Pending" },
          ].map((s) => (
            <GlassCard key={s.l} padding="14px 18px">
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "var(--fs-3xl)",
                    fontWeight: 800,
                    color: "var(--color-text-primary)",
                    lineHeight: 1,
                  }}
                >
                  {s.v}
                </div>
                <div
                  style={{
                    fontSize: "var(--fs-xs)",
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginTop: "var(--space-4)",
                    fontWeight: 500,
                  }}
                >
                  {s.l}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Sidebar + content layout */}
        <div
          className="responsive-catalog-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "260px minmax(0, 1fr)",
            gap: "var(--space-24)",
          }}
        >
          <CatalogFilters
            currentQ={q}
            currentSort={sort}
            currentPlatform={platform}
            platformCounts={platformCounts}
            regionCounts={regionCounts}
            total={total}
          />

          <div>
            {/* Grid */}
            {items.length > 0 ? (
              <div
                className="responsive-grid-cards"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "var(--space-16)",
                }}
              >
                {items.map((item, i) => (
                  <Link
                    key={item.id}
                    href={`/catalog/${item.id}`}
                    className={`pkg-card-link animate-slide-up delay-${Math.min(i + 1, 6)}`}
                  >
                    <GlassCard
                      className="pkg-card"
                      padding="0"
                      style={{
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      <div
                        className="pkg-cover"
                        style={{
                          height: 116,
                          position: "relative",
                          overflow: "hidden",
                          background: `linear-gradient(135deg,
                      hsl(${((i + offset) * 47) % 360}, 55%, 45%) 0%,
                      hsl(${((i + offset) * 47 + 50) % 360}, 55%, 28%) 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {item.gameCoverUrl && (
                          <img
                            src={item.gameCoverUrl}
                            alt=""
                            loading="lazy"
                            style={{
                              position: "absolute",
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              zIndex: 0,
                            }}
                          />
                        )}
                        {!item.gameCoverUrl && (
                          <span
                            style={{
                              position: "relative",
                              zIndex: 1,
                              fontSize: "var(--fs-5xl)",
                              fontWeight: 900,
                              color: "rgba(255,255,255,0.85)",
                              letterSpacing: "-0.04em",
                              textShadow: "0 2px 14px rgba(0,0,0,0.25)",
                            }}
                          >
                            {(item.gameTitle ?? item.title).slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        {item.downloadCount > 50 && (
                          <span
                            style={{
                              position: "absolute",
                              zIndex: 1,
                              top: 8,
                              right: 8,
                              background: "rgba(0,0,0,0.35)",
                              backdropFilter: "blur(8px)",
                              padding: "2px 8px",
                              borderRadius: "var(--radius-pill)",
                              fontSize: "var(--fs-2xs)",
                              fontWeight: 700,
                              color: "#fff",
                              letterSpacing: "0.05em",
                            }}
                          >
                            <IconFire
                              size={12}
                              style={{ display: "inline", verticalAlign: "middle" }}
                            />{" "}
                            hot
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          padding: "var(--space-14)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "var(--space-6)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "var(--fs-lg)",
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {item.title}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            gap: "var(--space-6)",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          {item.gamePlatform && <Tag>{item.gamePlatform}</Tag>}
                          {item.gameRegion && <Tag>{item.gameRegion}</Tag>}
                          {item.version && (
                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: "var(--fs-xs)",
                                color: "var(--color-text-muted)",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              {item.version}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "var(--space-4)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "var(--fs-xs)",
                              color: "var(--color-text-muted)",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {formatBytes(item.sizeBytes)}
                          </span>
                          <span
                            style={{
                              fontSize: "var(--fs-xs)",
                              fontFamily: "var(--font-mono)",
                              color:
                                item.sha256 !== "pending"
                                  ? "var(--color-success)"
                                  : "var(--color-warning)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "var(--space-4)",
                            }}
                          >
                            {item.sha256 !== "pending" ? (
                              <>
                                <IconCheck size={11} /> verified
                              </>
                            ) : (
                              <>
                                <IconQueue size={11} /> pending
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            ) : (
              <GlassCard
                padding="80px 40px"
                className="animate-fade-in"
                style={{ textAlign: "center" }}
              >
                <div
                  style={{
                    fontSize: "var(--fs-7xl)",
                    marginBottom: "var(--space-16)",
                    opacity: 0.3,
                  }}
                >
                  <IconCatalog size={48} />
                </div>
                <h2
                  style={{
                    fontSize: "var(--fs-2xl)",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: "var(--space-8)",
                  }}
                >
                  {q ? `No results for "${q}"` : "No packages yet"}
                </h2>
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    marginBottom: "var(--space-24)",
                    fontSize: "var(--fs-lg)",
                  }}
                >
                  {q ? "Try different search terms." : "Be the first to contribute to the archive."}
                </p>
                <Link href="/upload" className="btn-primary">
                  ＋ Upload PKG
                </Link>
              </GlassCard>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "var(--space-8)",
                  marginTop: "var(--space-32)",
                }}
              >
                {page > 1 && (
                  <Link
                    href={`/catalog?${new URLSearchParams({ ...(q && { q }), ...(sort !== "newest" && { sort }), page: String(page - 1) })}`}
                    className="btn-secondary"
                  >
                    ← Previous
                  </Link>
                )}
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "var(--fs-md)",
                    color: "var(--color-text-muted)",
                    padding: "0 16px",
                  }}
                >
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/catalog?${new URLSearchParams({ ...(q && { q }), ...(sort !== "newest" && { sort }), page: String(page + 1) })}`}
                    className="btn-secondary"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
