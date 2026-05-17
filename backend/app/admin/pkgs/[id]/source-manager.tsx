"use client";

import { GlassCard } from "@/components/liquid/glass";
import { IconSearch } from "@/components/ui/icons";
import { LiquidButton } from "@/components/ui/liquid-button";
import { useState } from "react";

const providers = [
  { value: "direct", label: "Direct URL" },
  { value: "gdrive", label: "Google Drive" },
  { value: "mega", label: "Mega.nz" },
  { value: "mediafire", label: "MediaFire" },
  { value: "archive_org", label: "Internet Archive" },
  { value: "torrent", label: "Torrent / Magnet" },
  { value: "onedrive", label: "OneDrive" },
  { value: "r2", label: "Cloudflare R2" },
  { value: "other", label: "Other" },
];

const statusConfig: Record<string, { color: string; label: string }> = {
  alive: { color: "#34d399", label: "Alive" },
  dead: { color: "#f87171", label: "Dead" },
  unknown: { color: "var(--color-text-muted)", label: "Unknown" },
  checking: { color: "#fbbf24", label: "Checking" },
};

interface Source {
  id: string;
  provider: string;
  url: string;
  label: string | null;
  isPrimary: boolean;
  status: string;
  failCount: number;
  downloadCount: number;
  lastCheckedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export function PkgSourceManager({
  pkgId,
  sources: initialSources,
}: { pkgId: string; sources: Source[] }) {
  const [sources, setSources] = useState(initialSources);
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newProvider, setNewProvider] = useState("direct");
  const [newLabel, setNewLabel] = useState("");
  const [newPrimary, setNewPrimary] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const handleAdd = async () => {
    if (!newUrl.trim()) return;
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pkgId,
          provider: newProvider,
          url: newUrl.trim(),
          label: newLabel.trim() || undefined,
          isPrimary: newPrimary,
        }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch {
      // Handle error
    } finally {
      setAddLoading(false);
    }
  };

  const handleCheck = async (sourceId: string) => {
    try {
      await fetch(`/api/admin/sources/${sourceId}/check`, { method: "POST" });
      window.location.reload();
    } catch {
      // Handle error
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (!confirm("Delete this source?")) return;
    try {
      await fetch(`/api/admin/sources/${sourceId}`, { method: "DELETE" });
      setSources(sources.filter((s) => s.id !== sourceId));
    } catch {
      // Handle error
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: "9px 14px",
    borderRadius: 8,
    fontSize: "0.82rem",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "var(--color-text-primary)",
    outline: "none",
    width: "100%",
  };

  return (
    <GlassCard padding="20px 24px">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            margin: 0,
          }}
        >
          Download Sources ({sources.length})
        </h3>
        <LiquidButton
          variant={showAdd ? "ghost" : "primary"}
          size="sm"
          onClick={() => setShowAdd(!showAdd)}
          iconLeft={showAdd ? undefined : "+"}
        >
          {showAdd ? "Cancel" : "Add Source"}
        </LiquidButton>
      </div>

      {/* Add form */}
      {showAdd && (
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
            background: "rgba(99,102,241,0.04)",
            border: "1px solid rgba(99,102,241,0.1)",
          }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 10, marginBottom: 10 }}
          >
            <input
              type="url"
              placeholder="https://... or magnet:?xt=..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              style={inputStyle}
            />
            <select
              value={newProvider}
              onChange={(e) => setNewProvider(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {providers.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input
              placeholder="Label (optional, e.g. 'EU Mirror')"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              style={inputStyle}
            />
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <input
                type="checkbox"
                checked={newPrimary}
                onChange={(e) => setNewPrimary(e.target.checked)}
              />
              Primary
            </label>
            <LiquidButton
              variant="primary"
              size="sm"
              onClick={handleAdd}
              disabled={addLoading || !newUrl.trim()}
              iconLeft={addLoading ? "◓" : undefined}
            >
              {addLoading ? "Adding…" : "Add"}
            </LiquidButton>
          </div>
        </div>
      )}

      {/* Sources list */}
      {sources.length === 0 ? (
        <div
          style={{ padding: "30px 0", textAlign: "center", color: "#475569", fontSize: "0.85rem" }}
        >
          No sources yet. Add a download link above.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sources.map((source) => {
            const st = statusConfig[source.status] ??
              statusConfig.unknown ?? { color: "#64748b", label: "Unknown" };
            return (
              <div
                key={source.id}
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: st.color,
                    boxShadow: `0 0 6px ${st.color}40`,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--color-text-secondary)",
                        fontWeight: 500,
                      }}
                    >
                      {providers.find((p) => p.value === source.provider)?.label ?? source.provider}
                    </span>
                    {source.isPrimary && (
                      <span
                        style={{
                          fontSize: "0.6rem",
                          padding: "1px 5px",
                          borderRadius: 4,
                          color: "#818cf8",
                          background: "rgba(99,102,241,0.12)",
                          fontWeight: 600,
                        }}
                      >
                        PRIMARY
                      </span>
                    )}
                    {source.label && (
                      <span style={{ fontSize: "0.7rem", color: "#475569" }}>• {source.label}</span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "#475569",
                      fontFamily: "var(--font-mono)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginTop: 2,
                    }}
                  >
                    {source.url}
                  </div>
                </div>
                <span style={{ fontSize: "0.7rem", color: "#475569", whiteSpace: "nowrap" }}>
                  ↓{source.downloadCount}
                </span>
                <LiquidButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCheck(source.id)}
                  title="Check status"
                >
                  <IconSearch size={14} />
                </LiquidButton>
                <LiquidButton
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(source.id)}
                  title="Delete"
                >
                  ✗
                </LiquidButton>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
