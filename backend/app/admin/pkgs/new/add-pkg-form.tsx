"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/liquid/glass";
import { LiquidButton } from "@/components/ui/liquid-button";

const platforms = ["PS4", "PS5", "PS3", "PSP", "Vita"];
const regions = ["US", "EU", "JP", "ASIA"];
const providers = [
  { value: "direct", label: "Direct URL" },
  { value: "gdrive", label: "Google Drive" },
  { value: "mega", label: "Mega.nz" },
  { value: "mediafire", label: "MediaFire" },
  { value: "archive_org", label: "Internet Archive" },
  { value: "torrent", label: "Torrent / Magnet" },
  { value: "onedrive", label: "OneDrive" },
  { value: "other", label: "Other" },
];

interface SourceEntry {
  url: string;
  provider: string;
  label: string;
  isPrimary: boolean;
}

export function AddPkgForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PKG metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sha256, setSha256] = useState("");
  const [sizeGb, setSizeGb] = useState("");
  const [version, setVersion] = useState("");
  const [fwRequired, setFwRequired] = useState("");

  // Game metadata
  const [gameTitle, setGameTitle] = useState("");
  const [titleId, setTitleId] = useState("");
  const [platform, setPlatform] = useState("PS4");
  const [region, setRegion] = useState("US");

  // Sources
  const [sources, setSources] = useState<SourceEntry[]>([
    { url: "", provider: "direct", label: "", isPrimary: true },
  ]);

  const addSource = () => {
    setSources([...sources, { url: "", provider: "direct", label: "", isPrimary: false }]);
  };

  const removeSource = (idx: number) => {
    setSources(sources.filter((_, i) => i !== idx));
  };

  const updateSource = (idx: number, field: keyof SourceEntry, value: string | boolean) => {
    const newSources = [...sources];
    const current = newSources[idx];
    if (!current) return;
    newSources[idx] = { ...current, [field]: value };
    if (field === "isPrimary" && value) {
      // Only one primary
      newSources.forEach((s, i) => { if (i !== idx) s.isPrimary = false; });
    }
    setSources(newSources);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const sizeBytes = Math.round(parseFloat(sizeGb || "0") * 1_000_000_000);
      const validSources = sources.filter(s => s.url.trim());

      const res = await fetch("/api/admin/pkgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          sha256: sha256.trim() || "pending",
          sizeBytes,
          version: version.trim() || null,
          fwRequired: fwRequired.trim() || null,
          game: {
            title: gameTitle.trim() || title.trim(),
            titleId: titleId.trim() || null,
            platform,
            region,
          },
          sources: validSources.map(s => ({
            url: s.url.trim(),
            provider: s.provider,
            label: s.label.trim() || null,
            isPrimary: s.isPrimary,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create PKG");
        return;
      }

      const data = await res.json();
      router.push(`/admin/pkgs/${data.pkgId}`);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: "10px 14px", borderRadius: 10, fontSize: "0.85rem",
    border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
    color: "var(--color-text-primary)", outline: "none", width: "100%",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6, display: "block",
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{
          padding: "12px 16px", borderRadius: 10, marginBottom: 20,
          background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
          color: "#fca5a5", fontSize: "0.85rem",
        }}>
          {error}
        </div>
      )}

      {/* PKG Info */}
      <GlassCard padding="24px" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 16 }}>
          Package Info
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Title *</label>
            <input placeholder="e.g. God of War Ragnarök v1.00" value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Description</label>
            <textarea placeholder="Optional notes..." value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div>
            <label style={labelStyle}>SHA-256 Hash</label>
            <input placeholder="64-char hex or leave blank" value={sha256} onChange={e => setSha256(e.target.value)} maxLength={64} style={{ ...inputStyle, fontFamily: "var(--font-mono)", fontSize: "0.75rem" }} />
          </div>
          <div>
            <label style={labelStyle}>Size (GB)</label>
            <input type="number" step="0.01" placeholder="e.g. 45.2" value={sizeGb} onChange={e => setSizeGb(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Version</label>
            <input placeholder="e.g. 1.00" value={version} onChange={e => setVersion(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Min Firmware</label>
            <input placeholder="e.g. 11.00" value={fwRequired} onChange={e => setFwRequired(e.target.value)} style={inputStyle} />
          </div>
        </div>
      </GlassCard>

      {/* Game Info */}
      <GlassCard padding="24px" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 16 }}>
          Game Info
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 100px", gap: 14 }}>
          <div>
            <label style={labelStyle}>Game Title</label>
            <input placeholder="e.g. God of War Ragnarök" value={gameTitle} onChange={e => setGameTitle(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Title ID</label>
            <input placeholder="CUSA12345" value={titleId} onChange={e => setTitleId(e.target.value)} style={{ ...inputStyle, fontFamily: "var(--font-mono)", fontSize: "0.8rem" }} />
          </div>
          <div>
            <label style={labelStyle}>Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Region</label>
            <select value={region} onChange={e => setRegion(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Download Sources */}
      <GlassCard padding="24px" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
            Download Sources
          </h3>
          <LiquidButton type="button" variant="primary" size="sm" onClick={addSource} iconLeft="+">Add</LiquidButton>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sources.map((source, idx) => (
            <div key={idx} style={{
              padding: 12, borderRadius: 10,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 150px auto", gap: 8, alignItems: "center" }}>
                <input
                  placeholder="https://... or magnet:?xt=..."
                  value={source.url}
                  onChange={e => updateSource(idx, "url", e.target.value)}
                  style={{ ...inputStyle, fontSize: "0.8rem" }}
                />
                <select
                  value={source.provider}
                  onChange={e => updateSource(idx, "provider", e.target.value)}
                  style={{ ...inputStyle, fontSize: "0.8rem", cursor: "pointer" }}
                >
                  {providers.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "var(--color-text-muted)", cursor: "pointer" }}>
                    <input type="radio" checked={source.isPrimary} onChange={() => updateSource(idx, "isPrimary", true)} name="primary" /> ★
                  </label>
                  {sources.length > 1 && (
                    <LiquidButton type="button" variant="danger" size="sm" onClick={() => removeSource(idx)}>✗</LiquidButton>
                  )}
                </div>
              </div>
              <input
                placeholder="Label (optional)"
                value={source.label}
                onChange={e => updateSource(idx, "label", e.target.value)}
                style={{ ...inputStyle, fontSize: "0.75rem", marginTop: 6 }}
              />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Submit */}
      <LiquidButton
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={loading || !title.trim()}
        iconLeft={loading ? "◓" : undefined}
      >
        {loading ? "Creating…" : "Create PKG Entry"}
      </LiquidButton>
    </form>
  );
}
