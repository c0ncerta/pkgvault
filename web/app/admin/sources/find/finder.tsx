"use client";

import { GlassCard } from "@/components/liquid/glass";
import { LiquidButton } from "@/components/ui/liquid-button";
import Link from "next/link";
import { useState } from "react";

interface TorrentResult {
  name: string;
  infoHash: string;
  seeders: number;
  leechers: number;
  sizeBytes: number;
  magnet: string;
  downloadUrl: string;
  indexer?: string;
}

interface Selected {
  source: TorrentResult;
  title: string;
  platform: string;
  region: string;
}

const PLATFORMS = ["PS4", "PS5", "PS3", "PSP", "Vita"];

function fmtSize(n: number): string {
  if (!n) return "?";
  return n >= 1e9 ? `${(n / 1e9).toFixed(1)} GB` : `${(n / 1e6).toFixed(0)} MB`;
}

/** Best-effort game title from a messy scene release name. */
function cleanTitle(name: string): string {
  const stripped = name
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(PAL|NTSC(-[A-Z])?|MULTI\d*|RUS|ENG|EUR|USA|JPN|REPACK|FW\s?[\d.]+)\b/gi, " ")
    .replace(/[._]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped || name;
}

function detectPlatform(name: string): string {
  const n = name.toUpperCase();
  if (/\bPS5\b/.test(n)) return "PS5";
  if (/\bPS3\b/.test(n)) return "PS3";
  if (/\bPS\s?VITA\b|\bPSVITA\b|\bVITA\b|\bPSV\b/.test(n)) return "Vita";
  if (/\bPSP\b/.test(n)) return "PSP";
  return "PS4";
}

export function Finder() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<TorrentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ id: string; title: string } | null>(null);

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

  const search = async () => {
    if (q.trim().length < 2) return;
    setLoading(true);
    setError(null);
    setCreated(null);
    try {
      const res = await fetch(`/api/admin/torrent-search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Search failed");
        setResults([]);
        return;
      }
      setResults(data.results ?? []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const pick = (r: TorrentResult) => {
    setCreated(null);
    setError(null);
    setSelected({
      source: r,
      title: cleanTitle(r.name),
      platform: detectPlatform(r.name),
      region: "US",
    });
  };

  const create = async () => {
    if (!selected || !selected.title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      let magnet = selected.source.magnet;
      if (!magnet && selected.source.downloadUrl) {
        const r = await fetch("/api/admin/torrent-search/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: selected.source.downloadUrl }),
        });
        const d = await r.json();
        if (!r.ok) {
          setError(d.error ?? "Could not resolve magnet");
          return;
        }
        magnet = d.magnet;
      }
      if (!magnet) {
        setError("No magnet available");
        return;
      }
      const res = await fetch("/api/admin/pkgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selected.title.trim(),
          game: {
            title: selected.title.trim(),
            platform: selected.platform,
            region: selected.region.trim() || undefined,
          },
          sources: [{ provider: "torrent", url: magnet, isPrimary: true }],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || "Failed to create PKG");
        return;
      }
      setCreated({ id: data.pkgId, title: selected.title.trim() });
      setSelected(null);
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-16)" }}>
      <div>
        <h1
          style={{
            fontSize: "var(--fs-4xl)",
            fontWeight: 800,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          Find &amp; create
        </h1>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "var(--fs-md)",
            marginTop: "var(--space-4)",
          }}
        >
          Search torrents (Prowlarr / RuTracker) and create a catalog entry with one click. Nintendo
          titles are filtered out.
        </p>
      </div>

      {/* Search bar */}
      <div style={{ display: "flex", gap: "var(--space-10)" }}>
        <input
          placeholder="Search a game — e.g. 'God of War PS4'…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          style={inputStyle}
        />
        <LiquidButton
          variant="primary"
          size="md"
          onClick={search}
          disabled={loading || q.trim().length < 2}
        >
          {loading ? "Searching…" : "Search"}
        </LiquidButton>
      </div>

      {error && (
        <div
          style={{
            fontSize: "var(--fs-sm)",
            color: "var(--color-danger-bright)",
            padding: "10px 14px",
            borderRadius: "var(--radius-xs)",
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.18)",
          }}
        >
          {error}
        </div>
      )}

      {created && (
        <div
          style={{
            fontSize: "var(--fs-md)",
            color: "var(--color-success-bright)",
            padding: "12px 16px",
            borderRadius: "var(--radius-xs)",
            background: "rgba(52,211,153,0.08)",
            border: "1px solid rgba(52,211,153,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-12)",
            flexWrap: "wrap",
          }}
        >
          <span>
            Created <strong>{created.title}</strong> ✓
          </span>
          <span style={{ display: "flex", gap: "var(--space-12)" }}>
            <Link
              href={`/admin/pkgs/${created.id}`}
              style={{ color: "var(--color-accent-hover)", fontWeight: 600 }}
            >
              Edit / add mirrors →
            </Link>
            <Link href={`/catalog/${created.id}`} style={{ color: "var(--color-text-secondary)" }}>
              View public →
            </Link>
          </span>
        </div>
      )}

      {/* Editor for the picked result */}
      {selected && (
        <GlassCard padding="18px 20px" tint="accent">
          <div
            style={{
              fontSize: "var(--fs-2xs)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-text-muted)",
              marginBottom: "var(--space-8)",
            }}
          >
            New catalog entry from:{" "}
            <span style={{ fontFamily: "var(--font-mono)" }}>{selected.source.name}</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 140px 120px auto",
              gap: "var(--space-10)",
              alignItems: "center",
            }}
          >
            <input
              value={selected.title}
              onChange={(e) => setSelected({ ...selected, title: e.target.value })}
              placeholder="Game title"
              style={inputStyle}
            />
            <select
              value={selected.platform}
              onChange={(e) => setSelected({ ...selected, platform: e.target.value })}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              value={selected.region}
              onChange={(e) => setSelected({ ...selected, region: e.target.value })}
              placeholder="Region"
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: "var(--space-8)" }}>
              <LiquidButton variant="ghost" size="sm" onClick={() => setSelected(null)}>
                Cancel
              </LiquidButton>
              <LiquidButton
                variant="primary"
                size="sm"
                onClick={create}
                disabled={creating || !selected.title.trim()}
              >
                {creating ? "Creating…" : "Create PKG"}
              </LiquidButton>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Results */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        {results.map((r) => (
          <div
            key={r.infoHash || r.downloadUrl}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-12)",
              padding: "10px 14px",
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
                {fmtSize(r.sizeBytes)} · ▲{r.seeders} · ▼{r.leechers}
                {r.indexer ? ` · ${r.indexer}` : ""}
              </div>
            </div>
            <LiquidButton variant="secondary" size="sm" onClick={() => pick(r)}>
              Use →
            </LiquidButton>
          </div>
        ))}
        {!loading && results.length === 0 && (
          <div
            style={{
              fontSize: "var(--fs-sm)",
              color: "var(--color-text-faint)",
              textAlign: "center",
              padding: "var(--space-24) 0",
            }}
          >
            Search for a game to start.
          </div>
        )}
      </div>
    </div>
  );
}
