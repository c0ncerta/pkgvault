"use client";

import { GlassCard } from "@/components/liquid/glass";
import { IconSearch } from "@/components/ui/icons";
import { LiquidButton } from "@/components/ui/liquid-button";
import { torrentFileToMagnet } from "@/lib/torrent";
import { useState } from "react";

interface TorrentResult {
  name: string;
  infoHash: string;
  seeders: number;
  leechers: number;
  sizeBytes: number;
  magnet: string;
  downloadUrl: string;
}

function fmtSize(n: number): string {
  if (!n) return "?";
  return n >= 1e9 ? `${(n / 1e9).toFixed(1)} GB` : `${(n / 1e6).toFixed(0)} MB`;
}

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
  alive: { color: "var(--color-success-bright)", label: "Alive" },
  dead: { color: "var(--color-danger-bright)", label: "Dead" },
  unknown: { color: "var(--color-text-muted)", label: "Unknown" },
  checking: { color: "var(--color-warning-bright)", label: "Checking" },
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

  // Torrent search panel
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<TorrentResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (searchQ.trim().length < 2) return;
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/admin/torrent-search?q=${encodeURIComponent(searchQ.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error ?? "Search failed");
        setSearchResults([]);
        return;
      }
      setSearchResults(data.results ?? []);
    } catch {
      setSearchError("Network error");
    } finally {
      setSearchLoading(false);
    }
  };

  const [addingKey, setAddingKey] = useState<string | null>(null);

  const addResult = async (r: TorrentResult) => {
    const key = r.infoHash || r.downloadUrl;
    setAddingKey(key);
    setSearchError(null);
    try {
      let magnet = r.magnet;
      // RuTracker & co. don't expose magnets — resolve the .torrent → magnet first.
      if (!magnet && r.downloadUrl) {
        const res = await fetch("/api/admin/torrent-search/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: r.downloadUrl }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSearchError(data.error ?? "Could not resolve torrent");
          return;
        }
        magnet = data.magnet;
      }
      if (!magnet) {
        setSearchError("No magnet available for this result");
        return;
      }
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pkgId,
          provider: "torrent",
          url: magnet,
          label: r.name.slice(0, 200),
        }),
      });
      if (res.ok) window.location.reload();
      else setSearchError("Could not add source");
    } catch {
      setSearchError("Network error");
    } finally {
      setAddingKey(null);
    }
  };

  const handleConvert = async (file: File | undefined) => {
    if (!file) return;
    setConvertError(null);
    try {
      const magnet = await torrentFileToMagnet(file);
      setNewProvider("torrent");
      setNewUrl(magnet);
    } catch (e) {
      setConvertError((e as Error).message);
    }
  };

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
    borderRadius: "var(--radius-xs)",
    fontSize: "var(--fs-base)",
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
          marginBottom: "var(--space-16)",
        }}
      >
        <h3
          style={{
            fontSize: "var(--fs-base)",
            fontWeight: 600,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            margin: 0,
          }}
        >
          Download Sources ({sources.length})
        </h3>
        <div style={{ display: "flex", gap: "var(--space-8)" }}>
          <LiquidButton
            variant={showSearch ? "primary" : "secondary"}
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? "Close search" : "Find torrent"}
          </LiquidButton>
          <LiquidButton
            variant={showAdd ? "ghost" : "primary"}
            size="sm"
            onClick={() => setShowAdd(!showAdd)}
            iconLeft={showAdd ? undefined : "+"}
          >
            {showAdd ? "Cancel" : "Add Source"}
          </LiquidButton>
        </div>
      </div>

      {/* Torrent search panel (apibay) */}
      {showSearch && (
        <div
          style={{
            padding: "var(--space-16)",
            borderRadius: "var(--radius-base)",
            marginBottom: "var(--space-16)",
            background: "rgba(34,211,238,0.04)",
            border: "1px solid rgba(34,211,238,0.12)",
          }}
        >
          <div style={{ display: "flex", gap: "var(--space-10)", marginBottom: "var(--space-10)" }}>
            <input
              placeholder="Search torrents (e.g. 'God of War PS4')…"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={inputStyle}
            />
            <LiquidButton
              variant="primary"
              size="sm"
              onClick={handleSearch}
              disabled={searchLoading || searchQ.trim().length < 2}
            >
              {searchLoading ? "Searching…" : "Search"}
            </LiquidButton>
          </div>
          <div
            style={{
              fontSize: "var(--fs-2xs)",
              color: "var(--color-text-faint)",
              marginBottom: "var(--space-10)",
            }}
          >
            Public indexer · Nintendo titles filtered out · adds as a magnet source
          </div>

          {searchError && (
            <div
              style={{
                fontSize: "var(--fs-xs)",
                color: "var(--color-danger-bright)",
                marginBottom: "var(--space-8)",
              }}
            >
              {searchError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            {searchResults.map((r) => (
              <div
                key={r.infoHash || r.downloadUrl}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-10)",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-xs)",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "var(--fs-sm)",
                      color: "var(--color-text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.name}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--fs-2xs)",
                      color: "var(--color-text-faint)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {fmtSize(r.sizeBytes)} · ▲{r.seeders} seed · ▼{r.leechers}
                  </div>
                </div>
                <LiquidButton
                  variant="secondary"
                  size="sm"
                  onClick={() => addResult(r)}
                  disabled={addingKey === (r.infoHash || r.downloadUrl)}
                >
                  {addingKey === (r.infoHash || r.downloadUrl) ? "Adding…" : "Add"}
                </LiquidButton>
              </div>
            ))}
            {!searchLoading && searchResults.length === 0 && !searchError && (
              <div
                style={{
                  fontSize: "var(--fs-xs)",
                  color: "var(--color-text-faint)",
                  textAlign: "center",
                  padding: "var(--space-12) 0",
                }}
              >
                No results yet — try a search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div
          style={{
            padding: "var(--space-16)",
            borderRadius: "var(--radius-base)",
            marginBottom: "var(--space-16)",
            background: "rgba(99,102,241,0.04)",
            border: "1px solid rgba(99,102,241,0.1)",
          }}
        >
          <div
            className="admin-source-add-primary"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 160px",
              gap: "var(--space-10)",
              marginBottom: "var(--space-10)",
            }}
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

          {newProvider === "torrent" && (
            <div
              style={{
                marginBottom: "var(--space-10)",
                padding: "10px 12px",
                borderRadius: "var(--radius-xs)",
                background: "rgba(245,158,11,0.07)",
                border: "1px solid rgba(245,158,11,0.18)",
                fontSize: "var(--fs-xs)",
                color: "var(--color-text-secondary)",
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: "var(--color-warning-bright)" }}>Magnets only.</strong> Paste
              a <code style={{ fontFamily: "var(--font-mono)" }}>magnet:?xt=…</code> link — not a
              .torrent file. Got a .torrent? Convert it here (stays in your browser):
              <div style={{ marginTop: "var(--space-8)" }}>
                <input
                  type="file"
                  accept=".torrent,application/x-bittorrent"
                  onChange={(e) => handleConvert(e.target.files?.[0])}
                  style={{ fontSize: "var(--fs-xs)", color: "var(--color-text-faint)" }}
                />
              </div>
              {convertError && (
                <div style={{ marginTop: "var(--space-6)", color: "var(--color-danger-bright)" }}>
                  {convertError}
                </div>
              )}
            </div>
          )}

          <div
            className="admin-source-add-secondary"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              gap: "var(--space-10)",
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
                gap: "var(--space-6)",
                fontSize: "var(--fs-base)",
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
          style={{
            padding: "30px 0",
            textAlign: "center",
            color: "var(--color-text-faint)",
            fontSize: "var(--fs-md)",
          }}
        >
          No sources yet. Add a download link above.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
          {sources.map((source) => {
            const st = statusConfig[source.status] ??
              statusConfig["unknown"] ?? { color: "var(--color-text-muted)", label: "Unknown" };
            return (
              <div
                className="admin-pkg-source-row"
                key={source.id}
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-12)",
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
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
                    <span
                      style={{
                        fontSize: "var(--fs-sm)",
                        color: "var(--color-text-secondary)",
                        fontWeight: 500,
                      }}
                    >
                      {providers.find((p) => p.value === source.provider)?.label ?? source.provider}
                    </span>
                    {source.isPrimary && (
                      <span
                        style={{
                          fontSize: "var(--fs-2xs)",
                          padding: "1px 5px",
                          borderRadius: "var(--radius-2xs)",
                          color: "var(--color-accent-hover)",
                          background: "rgba(99,102,241,0.12)",
                          fontWeight: 600,
                        }}
                      >
                        PRIMARY
                      </span>
                    )}
                    {source.label && (
                      <span style={{ fontSize: "var(--fs-xs)", color: "var(--color-text-faint)" }}>
                        • {source.label}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--fs-xs)",
                      color: "var(--color-text-faint)",
                      fontFamily: "var(--font-mono)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginTop: "var(--space-2)",
                    }}
                  >
                    {source.url}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "var(--fs-xs)",
                    color: "var(--color-text-faint)",
                    whiteSpace: "nowrap",
                  }}
                >
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
