"use client";

import { GlassCard } from "@/components/liquid/glass";
import { LiquidButton } from "@/components/ui/liquid-button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const platforms = ["PS4", "PS5", "PS3", "PSP", "Vita"];
const regions = ["US", "EU", "JP", "ASIA"];
const sha256Pattern = /^[a-f0-9]{64}$/;
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
      newSources.forEach((s, i) => {
        if (i !== idx) s.isPrimary = false;
      });
    }
    setSources(newSources);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const sizeBytes = Math.round(Number.parseFloat(sizeGb || "0") * 1_000_000_000);
      const validSources = sources.filter((s) => s.url.trim());
      const normalizedSha256 = sha256.trim().toLowerCase();

      if (!sha256Pattern.test(normalizedSha256)) {
        setError("SHA-256 must be 64 lowercase hex characters");
        return;
      }

      const res = await fetch("/api/admin/pkgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          sha256: normalizedSha256,
          sizeBytes,
          version: version.trim() || null,
          fwRequired: fwRequired.trim() || null,
          game: {
            title: gameTitle.trim() || title.trim(),
            titleId: titleId.trim() || null,
            platform,
            region,
          },
          sources: validSources.map((s) => ({
            url: s.url.trim(),
            provider: s.provider,
            label: s.label.trim() || null,
            isPrimary: s.isPrimary,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || data.error || "Failed to create PKG");
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
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: "var(--fs-md)",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "var(--color-text-primary)",
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "var(--fs-sm)",
    fontWeight: 600,
    color: "var(--color-text-secondary)",
    marginBottom: 6,
    display: "block",
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            marginBottom: 20,
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            color: "#fca5a5",
            fontSize: "var(--fs-md)",
          }}
        >
          {error}
        </div>
      )}

      {/* PKG Info */}
      <GlassCard padding="24px" style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: "var(--fs-base)",
            fontWeight: 600,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 16,
          }}
        >
          Package Info
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="pkg-title" style={labelStyle}>
              Title *
            </label>
            <input
              id="pkg-title"
              placeholder="e.g. God of War Ragnarök v1.00"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="pkg-description" style={labelStyle}>
              Description
            </label>
            <textarea
              id="pkg-description"
              placeholder="Optional notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
          <div>
            <label htmlFor="pkg-sha256" style={labelStyle}>
              SHA-256 Hash *
            </label>
            <input
              id="pkg-sha256"
              placeholder="64 lowercase hex characters"
              value={sha256}
              onChange={(e) => setSha256(e.target.value.toLowerCase())}
              maxLength={64}
              required
              style={{ ...inputStyle, fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)" }}
            />
          </div>
          <div>
            <label htmlFor="pkg-size" style={labelStyle}>
              Size (GB)
            </label>
            <input
              id="pkg-size"
              type="number"
              step="0.01"
              placeholder="e.g. 45.2"
              value={sizeGb}
              onChange={(e) => setSizeGb(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="pkg-version" style={labelStyle}>
              Version
            </label>
            <input
              id="pkg-version"
              placeholder="e.g. 1.00"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="pkg-firmware" style={labelStyle}>
              Min Firmware
            </label>
            <input
              id="pkg-firmware"
              placeholder="e.g. 11.00"
              value={fwRequired}
              onChange={(e) => setFwRequired(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </GlassCard>

      {/* Game Info */}
      <GlassCard padding="24px" style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: "var(--fs-base)",
            fontWeight: 600,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 16,
          }}
        >
          Game Info
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 100px", gap: 14 }}>
          <div>
            <label htmlFor="game-title" style={labelStyle}>
              Game Title
            </label>
            <input
              id="game-title"
              placeholder="e.g. God of War Ragnarök"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="title-id" style={labelStyle}>
              Title ID
            </label>
            <input
              id="title-id"
              placeholder="CUSA12345"
              value={titleId}
              onChange={(e) => setTitleId(e.target.value)}
              style={{ ...inputStyle, fontFamily: "var(--font-mono)", fontSize: "var(--fs-base)" }}
            />
          </div>
          <div>
            <label htmlFor="platform" style={labelStyle}>
              Platform
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="region" style={labelStyle}>
              Region
            </label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Download Sources */}
      <GlassCard padding="24px" style={{ marginBottom: 24 }}>
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
              fontSize: "var(--fs-base)",
              fontWeight: 600,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              margin: 0,
            }}
          >
            Download Sources
          </h3>
          <LiquidButton type="button" variant="primary" size="sm" onClick={addSource} iconLeft="+">
            Add
          </LiquidButton>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sources.map((source, idx) => (
            <div
              key={`${source.url}-${source.provider}-${idx}`}
              style={{
                padding: 12,
                borderRadius: 10,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 150px auto",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <input
                  placeholder="https://... or magnet:?xt=..."
                  value={source.url}
                  onChange={(e) => updateSource(idx, "url", e.target.value)}
                  style={{ ...inputStyle, fontSize: "var(--fs-base)" }}
                />
                <select
                  value={source.provider}
                  onChange={(e) => updateSource(idx, "provider", e.target.value)}
                  style={{ ...inputStyle, fontSize: "var(--fs-base)", cursor: "pointer" }}
                >
                  {providers.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "var(--fs-xs)",
                      color: "var(--color-text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      checked={source.isPrimary}
                      onChange={() => updateSource(idx, "isPrimary", true)}
                      name="primary"
                    />{" "}
                    ★
                  </label>
                  {sources.length > 1 && (
                    <LiquidButton
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeSource(idx)}
                    >
                      ✗
                    </LiquidButton>
                  )}
                </div>
              </div>
              <input
                placeholder="Label (optional)"
                value={source.label}
                onChange={(e) => updateSource(idx, "label", e.target.value)}
                style={{ ...inputStyle, fontSize: "var(--fs-sm)", marginTop: 6 }}
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
        disabled={loading || !title.trim() || !sha256Pattern.test(sha256.trim())}
        iconLeft={loading ? "◓" : undefined}
      >
        {loading ? "Creating…" : "Create PKG Entry"}
      </LiquidButton>
    </form>
  );
}
