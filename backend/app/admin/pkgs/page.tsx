import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { pkgFiles, games, pkgSources, users } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { GlassCard } from "@/components/liquid/glass";
import { IconAlertTriangle } from "@/components/ui/icons";

export const metadata: Metadata = { title: "PKG Manager" };

function formatBytes(bytes: bigint | number): string {
  const num = Number(bytes);
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)} GB`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)} MB`;
  return `${(num / 1e3).toFixed(0)} KB`;
}

const statusColors: Record<string, string> = {
  approved: "#34d399",
  pending: "#fbbf24",
  rejected: "#f87171",
  taken_down: "#64748b",
};

export default async function PkgManagerPage() {
  let pkgs: {
    id: string; title: string; status: string; sizeBytes: bigint;
    downloadCount: number; sha256: string; createdAt: Date;
    uploaderName: string | null; gamePlatform: string | null;
    sourceCount: number; aliveCount: number; deadCount: number;
  }[] = [];

  try {
    const rows = await db
      .select({
        id: pkgFiles.id,
        title: pkgFiles.title,
        status: pkgFiles.status,
        sizeBytes: pkgFiles.sizeBytes,
        downloadCount: pkgFiles.downloadCount,
        sha256: pkgFiles.sha256,
        createdAt: pkgFiles.createdAt,
        uploaderName: users.name,
        gamePlatform: games.platform,
      })
      .from(pkgFiles)
      .leftJoin(users, eq(pkgFiles.uploaderId, users.id))
      .leftJoin(games, eq(pkgFiles.gameId, games.id))
      .where(sql`${pkgFiles.deletedAt} IS NULL`)
      .orderBy(desc(pkgFiles.createdAt))
      .limit(100);

    // Get source counts per PKG
    const sourceCountsRaw = await db
      .select({
        pkgId: pkgSources.pkgId,
        total: sql<number>`count(*)`,
        alive: sql<number>`count(*) filter (where ${pkgSources.status} = 'alive')`,
        dead: sql<number>`count(*) filter (where ${pkgSources.status} = 'dead')`,
      })
      .from(pkgSources)
      .groupBy(pkgSources.pkgId);

    const sourceCounts = new Map(sourceCountsRaw.map(r => [r.pkgId, r]));

    pkgs = rows.map(r => ({
      ...r,
      sourceCount: sourceCounts.get(r.id)?.total ?? 0,
      aliveCount: sourceCounts.get(r.id)?.alive ?? 0,
      deadCount: sourceCounts.get(r.id)?.dead ?? 0,
    }));
  } catch {
    // DB offline
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>
            PKG Manager
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
            {pkgs.length} packages — manage metadata, sources, and status
          </p>
        </div>
        <Link href="/admin/pkgs/new" className="btn-primary" style={{ fontSize: "0.85rem" }}>
          + Add PKG
        </Link>
      </div>

      {/* Table */}
      <GlassCard variant="content" cornerRadius={16} padding="0" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Title", "Platform", "Size", "Status", "Sources", "Downloads", "Date"].map(h => (
                <th key={h} style={{
                  padding: "12px 16px", textAlign: "left", fontWeight: 600,
                  color: "var(--color-text-muted)", fontSize: "0.7rem", textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pkgs.map((pkg) => (
              <tr key={pkg.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "12px 16px" }}>
                  <Link href={`/admin/pkgs/${pkg.id}`} style={{ color: "var(--color-text-primary)", textDecoration: "none", fontWeight: 500 }}>
                    {pkg.title}
                  </Link>
                  {pkg.uploaderName && (
                    <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: 2 }}>
                      by @{pkg.uploaderName}
                    </div>
                  )}
                </td>
                <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)" }}>
                  {pkg.gamePlatform ?? "—"}
                </td>
                <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
                  {formatBytes(pkg.sizeBytes)}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600,
                    color: statusColors[pkg.status] ?? "#64748b",
                    background: `${statusColors[pkg.status] ?? "#64748b"}15`,
                    border: `1px solid ${statusColors[pkg.status] ?? "#64748b"}30`,
                  }}>
                    {pkg.status}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{pkg.sourceCount}</span>
                    {pkg.aliveCount > 0 && <span style={{ color: "#34d399", fontSize: "0.7rem" }}>✓{pkg.aliveCount}</span>}
                    {pkg.deadCount > 0 && <span style={{ color: "#f87171", fontSize: "0.7rem" }}>✗{pkg.deadCount}</span>}
                    {pkg.sourceCount === 0 && <span style={{ color: "#f87171", fontSize: "0.7rem", display: "inline-flex", alignItems: "center", gap: 2 }}><IconAlertTriangle size={10} /> none</span>}
                  </div>
                </td>
                <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
                  {pkg.downloadCount}
                </td>
                <td style={{ padding: "12px 16px", color: "#475569", fontSize: "0.75rem" }}>
                  {pkg.createdAt.toISOString().slice(0, 10)}
                </td>
              </tr>
            ))}
            {pkgs.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "60px 16px", textAlign: "center", color: "#475569" }}>
                  No packages yet. Click "+ Add PKG" to register one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
