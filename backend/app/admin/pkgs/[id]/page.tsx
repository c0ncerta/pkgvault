import { GlassCard } from "@/components/liquid/glass";
import { IconExternalLink } from "@/components/ui/icons";
import { games, pkgFiles, pkgSources, users } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PkgMetadataEditor } from "./pkg-metadata-editor";
import { PkgSourceManager } from "./source-manager";
import { PkgStatusControl } from "./status-control";

function formatBytes(bytes: bigint | number): string {
  const num = Number(bytes);
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)} GB`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)} MB`;
  return `${(num / 1e3).toFixed(0)} KB`;
}

const statusColors: Record<string, string> = {
  approved: "#34d399",
  pending: "#fbbf24",
  rejected: "#f87171",
  taken_down: "#64748b",
};

export default async function AdminPkgDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let pkg: {
    id: string;
    title: string;
    description: string | null;
    sha256: string;
    sizeBytes: bigint;
    r2Key: string | null;
    originalFilename: string | null;
    version: string | null;
    fwRequired: string | null;
    status: string;
    downloadCount: number;
    createdAt: Date;
    uploaderName: string | null;
    gameTitle: string | null;
    gameTitleId: string | null;
    gamePlatform: string | null;
    gameRegion: string | null;
    gameCoverUrl: string | null;
  } | null = null;

  let sources: {
    id: string;
    provider: string;
    url: string;
    label: string | null;
    isPrimary: boolean;
    status: string;
    failCount: number;
    downloadCount: number;
    lastCheckedAt: Date | null;
    notes: string | null;
    createdAt: Date;
  }[] = [];

  try {
    const rows = await db
      .select({
        id: pkgFiles.id,
        title: pkgFiles.title,
        description: pkgFiles.description,
        sha256: pkgFiles.sha256,
        sizeBytes: pkgFiles.sizeBytes,
        r2Key: pkgFiles.r2Key,
        originalFilename: pkgFiles.originalFilename,
        version: pkgFiles.version,
        fwRequired: pkgFiles.fwRequired,
        status: pkgFiles.status,
        downloadCount: pkgFiles.downloadCount,
        createdAt: pkgFiles.createdAt,
        uploaderName: users.name,
        gameTitle: games.title,
        gameTitleId: games.titleId,
        gamePlatform: games.platform,
        gameRegion: games.region,
        gameCoverUrl: games.coverUrl,
      })
      .from(pkgFiles)
      .leftJoin(users, eq(pkgFiles.uploaderId, users.id))
      .leftJoin(games, eq(pkgFiles.gameId, games.id))
      .where(eq(pkgFiles.id, id))
      .limit(1);

    if (rows.length === 0 || !rows[0]) notFound();
    pkg = rows[0];

    sources = await db
      .select({
        id: pkgSources.id,
        provider: pkgSources.provider,
        url: pkgSources.url,
        label: pkgSources.label,
        isPrimary: pkgSources.isPrimary,
        status: pkgSources.status,
        failCount: pkgSources.failCount,
        downloadCount: pkgSources.downloadCount,
        lastCheckedAt: pkgSources.lastCheckedAt,
        notes: pkgSources.notes,
        createdAt: pkgSources.createdAt,
      })
      .from(pkgSources)
      .where(eq(pkgSources.pkgId, id));
  } catch {
    notFound();
  }

  if (!pkg) notFound();

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div style={{ fontSize: "0.8rem", color: "#475569", marginBottom: 20 }}>
        <a href="/admin/pkgs" style={{ color: "#818cf8", textDecoration: "none" }}>
          PKG Manager
        </a>
        <span style={{ margin: "0 8px" }}>›</span>
        <span>{pkg.title}</span>
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.03em",
              marginBottom: 6,
            }}
          >
            {pkg.title}
          </h1>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              fontSize: "0.8rem",
              color: "var(--color-text-muted)",
            }}
          >
            {pkg.gamePlatform && <span>{pkg.gamePlatform}</span>}
            {pkg.version && <span>v{pkg.version}</span>}
            <span>{formatBytes(pkg.sizeBytes)}</span>
            <span>↓ {pkg.downloadCount}</span>
            <span>{pkg.createdAt.toISOString().slice(0, 10)}</span>
          </div>
        </div>

        <PkgStatusControl pkgId={pkg.id} currentStatus={pkg.status} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Info card */}
          <GlassCard variant="content" cornerRadius={16} padding="20px 24px">
            <h3
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 14,
              }}
            >
              Package Details
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: "8px 16px",
                fontSize: "0.85rem",
              }}
            >
              <span style={{ color: "#475569" }}>SHA-256</span>
              <span
                style={{
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  wordBreak: "break-all",
                }}
              >
                {pkg.sha256}
              </span>
              <span style={{ color: "#475569" }}>R2 Key</span>
              <span
                style={{
                  color: pkg.r2Key ? "#e8e8ed" : "#475569",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                }}
              >
                {pkg.r2Key ?? "— not on R2"}
              </span>
              <span style={{ color: "#475569" }}>Uploader</span>
              <span style={{ color: "var(--color-text-primary)" }}>
                {pkg.uploaderName ?? "unknown"}
              </span>
              <span style={{ color: "#475569" }}>Game</span>
              <span style={{ color: "var(--color-text-primary)" }}>{pkg.gameTitle ?? "—"}</span>
              {pkg.fwRequired && (
                <>
                  <span style={{ color: "#475569" }}>FW Required</span>
                  <span style={{ color: "var(--color-text-primary)" }}>{pkg.fwRequired}</span>
                </>
              )}
            </div>
            {pkg.description && (
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.85rem",
                  marginTop: 16,
                  lineHeight: 1.6,
                }}
              >
                {pkg.description}
              </p>
            )}
          </GlassCard>

          <PkgMetadataEditor
            pkg={{
              id: pkg.id,
              title: pkg.title,
              description: pkg.description,
              version: pkg.version,
              fwRequired: pkg.fwRequired,
              originalFilename: pkg.originalFilename,
              gameTitle: pkg.gameTitle,
              gameTitleId: pkg.gameTitleId,
              gamePlatform: pkg.gamePlatform,
              gameRegion: pkg.gameRegion,
              gameCoverUrl: pkg.gameCoverUrl,
            }}
          />

          {/* Sources */}
          <PkgSourceManager
            pkgId={pkg.id}
            sources={sources.map((s) => ({
              ...s,
              lastCheckedAt: s.lastCheckedAt?.toISOString() ?? null,
              createdAt: s.createdAt.toISOString(),
            }))}
          />
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Status */}
          <GlassCard variant="content" cornerRadius={16} padding="20px">
            <h3
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 12,
              }}
            >
              Status
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: statusColors[pkg.status] ?? "#64748b",
                  boxShadow: `0 0 8px ${statusColors[pkg.status] ?? "#64748b"}40`,
                }}
              />
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: statusColors[pkg.status] ?? "#64748b",
                  textTransform: "capitalize",
                }}
              >
                {pkg.status.replace("_", " ")}
              </span>
            </div>
          </GlassCard>

          {/* Sources summary */}
          <GlassCard variant="content" cornerRadius={16} padding="20px">
            <h3
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 12,
              }}
            >
              Download Sources
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(52,211,153,0.06)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#34d399" }}>
                  {sources.filter((s) => s.status === "alive").length}
                </div>
                <div style={{ fontSize: "0.65rem", color: "#475569", textTransform: "uppercase" }}>
                  Alive
                </div>
              </div>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(248,113,113,0.06)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f87171" }}>
                  {sources.filter((s) => s.status === "dead").length}
                </div>
                <div style={{ fontSize: "0.65rem", color: "#475569", textTransform: "uppercase" }}>
                  Dead
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 8,
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
                textAlign: "center",
              }}
            >
              <div
                style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text-primary)" }}
              >
                {sources.length}
              </div>
              <div style={{ fontSize: "0.65rem", color: "#475569", textTransform: "uppercase" }}>
                Total sources
              </div>
            </div>
          </GlassCard>

          {/* Public link */}
          <a
            href={`/catalog/${pkg.id}`}
            target="_blank"
            style={{ textDecoration: "none" }}
            rel="noreferrer"
          >
            <GlassCard variant="content" cornerRadius={16} padding="14px 20px">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: "0.85rem",
                  color: "#818cf8",
                  fontWeight: 500,
                }}
              >
                <IconExternalLink
                  size={16}
                  style={{ display: "inline", verticalAlign: "middle" }}
                />{" "}
                View public page →
              </div>
            </GlassCard>
          </a>
        </div>
      </div>
    </div>
  );
}
