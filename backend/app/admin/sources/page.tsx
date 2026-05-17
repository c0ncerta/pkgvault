import type { Metadata } from "next";
import { db } from "@/lib/db";
import { pkgSources, pkgFiles, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { GlassCard } from "@/components/liquid/glass";
import { SourceActions } from "./source-actions";

export const metadata: Metadata = { title: "Link Health" };

const statusConfig: Record<string, { color: string; icon: string; label: string }> = {
  alive: { color: "#34d399", icon: "✓", label: "Alive" },
  dead: { color: "#f87171", icon: "✗", label: "Dead" },
  unknown: { color: "var(--color-text-muted)", icon: "?", label: "Unknown" },
  checking: { color: "#fbbf24", icon: "⟳", label: "Checking" },
};

const providerLabels: Record<string, string> = {
  r2: "Cloudflare R2",
  direct: "Direct URL",
  gdrive: "Google Drive",
  mega: "Mega.nz",
  mediafire: "MediaFire",
  archive_org: "Internet Archive",
  torrent: "Torrent",
  onedrive: "OneDrive",
  other: "Other",
};

interface PageProps {
  searchParams: Promise<{ status?: string; tab?: string }>;
}

export default async function SourcesPage({ searchParams }: PageProps) {
  const { status: filterStatus } = await searchParams;

  let sources: {
    id: string; url: string; provider: string; status: string;
    label: string | null; isPrimary: boolean; failCount: number;
    downloadCount: number; lastCheckedAt: Date | null; createdAt: Date;
    pkgTitle: string; pkgId: string;
  }[] = [];

  try {
    const conditions = [];
    if (filterStatus && filterStatus !== "all") {
      conditions.push(eq(pkgSources.status, filterStatus as "alive" | "dead" | "unknown" | "checking"));
    }

    sources = (await db
      .select({
        id: pkgSources.id,
        url: pkgSources.url,
        provider: pkgSources.provider,
        status: pkgSources.status,
        label: pkgSources.label,
        isPrimary: pkgSources.isPrimary,
        failCount: pkgSources.failCount,
        downloadCount: pkgSources.downloadCount,
        lastCheckedAt: pkgSources.lastCheckedAt,
        createdAt: pkgSources.createdAt,
        pkgTitle: pkgFiles.title,
        pkgId: pkgFiles.id,
      })
      .from(pkgSources)
      .leftJoin(pkgFiles, eq(pkgSources.pkgId, pkgFiles.id))
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .orderBy(desc(pkgSources.createdAt))
      .limit(200)).map(r => ({
        ...r,
        pkgTitle: r.pkgTitle ?? "Unknown PKG",
        pkgId: r.pkgId ?? "",
      }));
  } catch {
    // DB offline
  }

  const statusFilters = [
    { value: "all", label: "All", count: sources.length },
    { value: "alive", label: "Alive" },
    { value: "dead", label: "Dead" },
    { value: "unknown", label: "Unknown" },
  ];

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.03em", marginBottom: 4 }}>
        Link Health
      </h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: 24 }}>
        Monitor and manage download sources — {sources.length} total links
      </p>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {statusFilters.map(f => {
          const active = (filterStatus ?? "all") === f.value;
          return (
            <a
              key={f.value}
              href={f.value === "all" ? "/admin/sources" : `/admin/sources?status=${f.value}`}
              style={{
                padding: "7px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 500,
                textDecoration: "none",
                color: active ? "#e8e8ed" : "#64748b",
                background: active ? "rgba(99, 102, 241, 0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? "rgba(99, 102, 241, 0.3)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              {f.label}
            </a>
          );
        })}
      </div>

      {/* Sources list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sources.map(source => {
          const st = statusConfig[source.status] ?? statusConfig['unknown'] ?? { color: '#64748b', icon: '?', label: 'Unknown' };
          return (
            <GlassCard key={source.id} variant="content" cornerRadius={14} padding="16px 20px">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Status indicator */}
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: st.color, flexShrink: 0,
                  boxShadow: `0 0 8px ${st.color}40`,
                }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <a href={`/admin/pkgs/${source.pkgId}`} style={{
                      color: "var(--color-text-primary)", fontWeight: 600, fontSize: "0.85rem",
                      textDecoration: "none",
                    }}>
                      {source.pkgTitle}
                    </a>
                    {source.isPrimary && (
                      <span style={{
                        padding: "1px 6px", borderRadius: 4, fontSize: "0.6rem",
                        fontWeight: 600, color: "#818cf8", background: "rgba(99,102,241,0.12)",
                      }}>PRIMARY</span>
                    )}
                    {source.label && (
                      <span style={{ fontSize: "0.75rem", color: "#475569" }}>({source.label})</span>
                    )}
                  </div>
                  <div style={{
                    fontSize: "0.75rem", color: "#475569", fontFamily: "var(--font-mono)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {source.url}
                  </div>
                </div>

                {/* Provider badge */}
                <span style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 500,
                  color: "var(--color-text-secondary)", background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap",
                }}>
                  {providerLabels[source.provider] ?? source.provider}
                </span>

                {/* Stats */}
                <div style={{ display: "flex", gap: 16, fontSize: "0.75rem", color: "#475569", whiteSpace: "nowrap" }}>
                  <span>↓ {source.downloadCount}</span>
                  {source.failCount > 0 && <span style={{ color: "#f87171" }}>✗{source.failCount}</span>}
                  <span>
                    {source.lastCheckedAt
                      ? source.lastCheckedAt.toISOString().slice(0, 10)
                      : "never checked"}
                  </span>
                </div>

                {/* Actions */}
                <SourceActions sourceId={source.id} currentStatus={source.status} />
              </div>
            </GlassCard>
          );
        })}

        {sources.length === 0 && (
          <GlassCard variant="content" cornerRadius={16} padding="60px 20px" style={{ textAlign: "center", color: "#475569" }}>
            No sources found. Add download links from the PKG Manager.
          </GlassCard>
        )}
      </div>
    </div>
  );
}
