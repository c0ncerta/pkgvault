"use client";

import { GlassCard } from "@/components/liquid/glass";
import { IconAlertTriangle, IconSearch } from "@/components/ui/icons";
import Link from "next/link";
import { useMemo, useState } from "react";

export type PkgManagerRow = {
  id: string;
  title: string;
  status: string;
  sizeBytes: string;
  downloadCount: number;
  sha256: string;
  createdAt: string;
  uploaderName: string | null;
  gamePlatform: string | null;
  sourceCount: number;
  aliveCount: number;
  deadCount: number;
};

const statusColors: Record<string, string> = {
  approved: "#34d399",
  pending: "#fbbf24",
  rejected: "#f87171",
  taken_down: "#64748b",
};

function formatBytes(bytes: string | bigint | number): string {
  const num = Number(bytes);
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)} GB`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)} MB`;
  return `${(num / 1e3).toFixed(0)} KB`;
}

export function PkgManagerTable({ pkgs }: { pkgs: PkgManagerRow[] }) {
  const [query, setQuery] = useState("");

  const filteredPkgs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return pkgs;

    return pkgs.filter((pkg) =>
      [
        pkg.title,
        pkg.status,
        pkg.sha256,
        pkg.uploaderName ?? "",
        pkg.gamePlatform ?? "",
        pkg.createdAt,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [pkgs, query]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <label style={{ position: "relative", display: "block", width: "min(100%, 360px)" }}>
          <IconSearch
            size={14}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
            }}
          />
          <input
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search packages, uploader, SHA..."
            style={{ paddingLeft: 34, height: 38, fontSize: "var(--fs-base)" }}
          />
        </label>
        <div
          style={{
            color: "var(--color-text-muted)",
            fontSize: "var(--fs-sm)",
            alignSelf: "center",
          }}
        >
          {filteredPkgs.length} shown
        </div>
      </div>

      <GlassCard variant="content" cornerRadius={16} padding="0" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fs-base)" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Title", "Platform", "Size", "Status", "Sources", "Downloads", "Date", ""].map(
                (h) => (
                  <th
                    key={h || "actions"}
                    style={{
                      padding: "12px 16px",
                      textAlign: h ? "left" : "right",
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      fontSize: "var(--fs-xs)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filteredPkgs.map((pkg) => (
              <tr key={pkg.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "12px 16px" }}>
                  <Link
                    href={`/admin/pkgs/${pkg.id}`}
                    style={{
                      color: "var(--color-text-primary)",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    {pkg.title}
                  </Link>
                  {pkg.uploaderName && (
                    <div style={{ fontSize: "var(--fs-xs)", color: "#475569", marginTop: 2 }}>
                      by @{pkg.uploaderName}
                    </div>
                  )}
                </td>
                <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)" }}>
                  {pkg.gamePlatform ?? "-"}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {formatBytes(pkg.sizeBytes)}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 999,
                      fontSize: "var(--fs-xs)",
                      fontWeight: 600,
                      color: statusColors[pkg.status] ?? "#64748b",
                      background: `${statusColors[pkg.status] ?? "#64748b"}15`,
                      border: `1px solid ${statusColors[pkg.status] ?? "#64748b"}30`,
                    }}
                  >
                    {pkg.status}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
                      {pkg.sourceCount}
                    </span>
                    {pkg.aliveCount > 0 && (
                      <span style={{ color: "#34d399", fontSize: "var(--fs-xs)" }}>
                        {pkg.aliveCount} alive
                      </span>
                    )}
                    {pkg.deadCount > 0 && (
                      <span style={{ color: "#f87171", fontSize: "var(--fs-xs)" }}>
                        {pkg.deadCount} dead
                      </span>
                    )}
                    {pkg.sourceCount === 0 && (
                      <span
                        style={{
                          color: "#f87171",
                          fontSize: "var(--fs-xs)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <IconAlertTriangle size={10} /> none
                      </span>
                    )}
                  </div>
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {pkg.downloadCount}
                </td>
                <td style={{ padding: "12px 16px", color: "#475569", fontSize: "var(--fs-sm)" }}>
                  {pkg.createdAt.slice(0, 10)}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <Link
                    href={`/admin/pkgs/${pkg.id}#edit`}
                    className="btn-secondary"
                    style={{
                      padding: "6px 10px",
                      fontSize: "var(--fs-xs)",
                      textDecoration: "none",
                    }}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {filteredPkgs.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{ padding: "60px 16px", textAlign: "center", color: "#475569" }}
                >
                  No packages match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
