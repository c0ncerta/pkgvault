import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { GlassCard, GlassEffectContainer } from "@/components/liquid/glass";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { IconCatalog, IconCheck, IconLink, IconQueue, IconUser } from "@/components/ui/icons";
import { SpecList } from "@/components/ui/spec-list";
import { Tag } from "@/components/ui/tag";
import { games, pkgFiles, pkgSources, users } from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailTabs } from "./detail-tabs";
import { DownloadButton } from "./download-button";
import { RelatedPkgs } from "./related-pkgs";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const [pkg] = await db
      .select({ title: pkgFiles.title })
      .from(pkgFiles)
      .where(eq(pkgFiles.id, id))
      .limit(1);
    return { title: pkg?.title ?? "Not Found" };
  } catch {
    return { title: "PKG Detail" };
  }
}

function formatBytes(bytes: bigint | number): string {
  const num = Number(bytes);
  if (num <= 0) return "—";
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} GB`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} MB`;
  return `${(num / 1_000).toFixed(0)} KB`;
}

export default async function PkgDetailPage({ params }: DetailPageProps) {
  const { id } = await params;

  let pkg:
    | {
        id: string;
        title: string;
        description: string | null;
        sha256: string;
        sizeBytes: bigint;
        version: string | null;
        fwRequired: string | null;
        downloadCount: number;
        originalFilename: string | null;
        createdAt: Date;
        uploaderName: string | null;
        gamePlatform: string | null;
        gameRegion: string | null;
        gameTitle: string | null;
        gameTitleId: string | null;
      }
    | undefined;

  try {
    const [result] = await db
      .select({
        id: pkgFiles.id,
        title: pkgFiles.title,
        description: pkgFiles.description,
        sha256: pkgFiles.sha256,
        sizeBytes: pkgFiles.sizeBytes,
        version: pkgFiles.version,
        fwRequired: pkgFiles.fwRequired,
        downloadCount: pkgFiles.downloadCount,
        originalFilename: pkgFiles.originalFilename,
        createdAt: pkgFiles.createdAt,
        uploaderName: users.name,
        gamePlatform: games.platform,
        gameRegion: games.region,
        gameTitle: games.title,
        gameTitleId: games.titleId,
      })
      .from(pkgFiles)
      .leftJoin(users, eq(pkgFiles.uploaderId, users.id))
      .leftJoin(games, eq(pkgFiles.gameId, games.id))
      .where(and(eq(pkgFiles.id, id), sql`${pkgFiles.deletedAt} IS NULL`))
      .limit(1);

    pkg = result;
  } catch {
    // DB offline
  }

  if (!pkg) return notFound();

  const isExternal = pkg.sha256 === "external";
  const verified = !isExternal && pkg.sha256 !== "pending";

  // Fetch available download sources
  let sources: {
    id: string;
    provider: string;
    url: string;
    label: string | null;
    status: string;
    isPrimary: boolean;
  }[] = [];
  try {
    sources = await db
      .select({
        id: pkgSources.id,
        provider: pkgSources.provider,
        url: pkgSources.url,
        label: pkgSources.label,
        status: pkgSources.status,
        isPrimary: pkgSources.isPrimary,
      })
      .from(pkgSources)
      .where(and(eq(pkgSources.pkgId, id), sql`${pkgSources.status} != 'dead'`));
  } catch {
    // DB error
  }

  const _providerLabels: Record<string, string> = {
    r2: "Direct",
    direct: "Direct",
    gdrive: "Google Drive",
    mega: "Mega.nz",
    mediafire: "MediaFire",
    archive_org: "Internet Archive",
    torrent: "Torrent",
    onedrive: "OneDrive",
    other: "Mirror",
  };

  // Deterministic gradient hue from id so cover stays stable across renders.
  const hueSeed = Number.parseInt(pkg.id.replace(/-/g, "").slice(0, 6), 16);
  const hue = hueSeed % 360;

  return (
    <>
      <Navbar />
      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 24px 64px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Breadcrumb items={[{ label: "Catalog", href: "/catalog" }, { label: pkg.title }]} />

        {/* Hero banner */}
        <div
          className="detail-hero-shell animate-fade-in"
          style={{
            position: "relative",
            marginBottom: "var(--space-24)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(135deg,
              hsl(${hue}, 65%, 40%) 0%,
              hsl(${(hue + 60) % 360}, 55%, 24%) 50%,
              hsl(${(hue + 120) % 360}, 45%, 18%) 100%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15), transparent 50%), linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(5,6,8,0.55) 100%)",
            }}
          />
          <div
            style={{
              position: "relative",
              padding: "40px 36px 36px",
              display: "grid",
              gridTemplateColumns: "160px 1fr",
              gap: "var(--space-32)",
              alignItems: "end",
            }}
            className="responsive-detail-hero"
          >
            <div
              style={{
                width: 160,
                height: 200,
                borderRadius: "var(--radius-md)",
                background: `linear-gradient(135deg, hsl(${hue}, 70%, 55%), hsl(${(hue + 50) % 360}, 65%, 30%))`,
                boxShadow: "0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--fs-7xl)",
                fontWeight: 900,
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "-0.04em",
                textShadow: "0 4px 14px rgba(0,0,0,0.35)",
              }}
            >
              {(pkg.gameTitle ?? pkg.title).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div
                style={{
                  fontSize: "var(--fs-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 600,
                  marginBottom: "var(--space-8)",
                }}
              >
                Package · {pkg.gamePlatform ?? "Unknown platform"}
              </div>
              <h1
                style={{
                  fontSize: "var(--fs-6xl)",
                  fontWeight: 900,
                  letterSpacing: "-0.035em",
                  color: "#fff",
                  marginBottom: "var(--space-10)",
                  lineHeight: 1.05,
                  textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                }}
              >
                {pkg.title}
              </h1>
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-6)",
                  flexWrap: "wrap",
                  marginBottom: "var(--space-14)",
                }}
              >
                {pkg.gamePlatform && <Tag>{pkg.gamePlatform}</Tag>}
                {pkg.version && <Tag>{pkg.version}</Tag>}
                {pkg.gameRegion && <Tag>{pkg.gameRegion}</Tag>}
                {pkg.fwRequired && <Tag>FW ≥ {pkg.fwRequired}</Tag>}
                <Tag variant={verified ? "success" : isExternal ? "default" : "warning"}>
                  {verified ? (
                    <>
                      <IconCheck size={12} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                      verified
                    </>
                  ) : isExternal ? (
                    <>
                      <IconLink size={12} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                      external source
                    </>
                  ) : (
                    <>
                      <IconQueue size={12} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                      pending hash
                    </>
                  )}
                </Tag>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-16)",
                  fontSize: "var(--fs-base)",
                  color: "rgba(255,255,255,0.78)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span>
                  <IconCatalog size={14} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                  {formatBytes(pkg.sizeBytes)}
                </span>
                <span>↓ {pkg.downloadCount.toLocaleString()}</span>
                <span>
                  <IconUser size={14} style={{ display: "inline", verticalAlign: "middle" }} /> @
                  {pkg.uploaderName ?? "unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="responsive-grid-2"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 320px",
            gap: "var(--space-24)",
          }}
        >
          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-24)" }}>
            <DetailTabs
              description={pkg.description}
              sha256={pkg.sha256}
              originalFilename={pkg.originalFilename}
              sources={sources}
              uploaderName={pkg.uploaderName}
              createdAt={pkg.createdAt.toISOString()}
              downloadCount={pkg.downloadCount}
              version={pkg.version}
              fwRequired={pkg.fwRequired}
              sizeBytes={String(pkg.sizeBytes)}
            />

            <RelatedPkgs pkgId={pkg.id} platform={pkg.gamePlatform} />
          </div>

          {/* Sticky sidebar */}
          <aside
            style={{
              position: "sticky",
              top: 84,
              alignSelf: "start",
            }}
          >
            <GlassEffectContainer
              spacing={24}
              style={{ display: "flex", flexDirection: "column", gap: "var(--space-14)" }}
            >
              <GlassCard variant="elevated" padding="20px" className="vault-lift" tint="accent">
                <DownloadButton
                  pkgId={pkg.id}
                  size={formatBytes(pkg.sizeBytes)}
                  rootzUrl={sources.find((s) => s.url.includes("rootz"))?.url ?? null}
                />
                {sources.length > 1 && (
                  <div
                    style={{
                      marginTop: "var(--space-12)",
                      fontSize: "var(--fs-xs)",
                      color: "var(--color-text-muted)",
                      textAlign: "center",
                    }}
                  >
                    {sources.length} mirror{sources.length === 1 ? "" : "s"} available
                  </div>
                )}
              </GlassCard>

              <GlassCard padding="20px" className="vault-lift" tint="cyan">
                <h3
                  style={{
                    fontSize: "var(--fs-xs)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    marginBottom: "var(--space-12)",
                  }}
                >
                  Technical specs
                </h3>
                <SpecList
                  items={[
                    { label: "size", value: formatBytes(pkg.sizeBytes) },
                    { label: "version", value: pkg.version ?? "—" },
                    { label: "platform", value: pkg.gamePlatform ?? "—" },
                    {
                      label: "region",
                      value: `${pkg.gameRegion ?? "—"} ${pkg.gameTitleId ? `(${pkg.gameTitleId})` : ""}`,
                    },
                    { label: "min fw", value: pkg.fwRequired ? `≥ ${pkg.fwRequired}` : "—" },
                    { label: "uploaded", value: pkg.createdAt.toISOString().slice(0, 10) },
                    { label: "uploader", value: `@${pkg.uploaderName ?? "unknown"}` },
                    { label: "downloads", value: String(pkg.downloadCount) },
                  ]}
                />
              </GlassCard>

              <GlassCard
                padding="16px"
                className="vault-lift"
                tint={verified ? "success" : isExternal ? "accent" : "warning"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-10)" }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: verified
                        ? "var(--color-success)"
                        : isExternal
                          ? "var(--color-accent)"
                          : "var(--color-warning)",
                      boxShadow: verified
                        ? "0 0 12px var(--color-success)"
                        : isExternal
                          ? "0 0 12px var(--color-accent)"
                          : "0 0 12px var(--color-warning)",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: "var(--fs-base)",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {verified ? "Hash verified" : isExternal ? "External source" : "Hash pending"}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--fs-xs)",
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {isExternal ? "No SHA-256 (user-submitted link)" : "SHA-256 integrity"}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </GlassEffectContainer>
          </aside>
        </div>
        <Footer />
      </main>
    </>
  );
}
