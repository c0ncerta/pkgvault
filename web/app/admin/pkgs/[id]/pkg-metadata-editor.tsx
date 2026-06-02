"use client";

import { GlassCard } from "@/components/liquid/glass";
import { IconAlertTriangle, IconCheck, IconFile, IconRefresh } from "@/components/ui/icons";
import { LiquidButton } from "@/components/ui/liquid-button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const platforms = ["PS4", "PS5", "PS3", "PSP", "Vita"];
const regions = ["US", "EU", "JP", "ASIA"];

export type PkgMetadataEditorData = {
  id: string;
  title: string;
  description: string | null;
  version: string | null;
  fwRequired: string | null;
  originalFilename: string | null;
  gameTitle: string | null;
  gameTitleId: string | null;
  gamePlatform: string | null;
  gameRegion: string | null;
  gameCoverUrl: string | null;
};

function cleanFilenameName(value: string) {
  return value
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/\b(CUSA|PPSA|NP[A-Z]{2}|PCSA|PCSE|ULUS|ULES|NPEB|NPUB)[A-Z0-9-]*\b/gi, "")
    .replace(/\b(v|ver|version)[ _.-]*\d+(\.\d+)*\b/gi, "")
    .replace(/[_()[\].-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectTitleId(value: string) {
  return (
    value.match(/\b(CUSA|PPSA|NP[A-Z]{2}|PCSA|PCSE|ULUS|ULES|NPEB|NPUB)[A-Z0-9-]*\b/i)?.[0] ?? ""
  ).toUpperCase();
}

export function PkgMetadataEditor({ pkg }: { pkg: PkgMetadataEditorData }) {
  const router = useRouter();
  const [title, setTitle] = useState(pkg.title);
  const [description, setDescription] = useState(pkg.description ?? "");
  const [version, setVersion] = useState(pkg.version ?? "");
  const [fwRequired, setFwRequired] = useState(pkg.fwRequired ?? "");
  const [gameTitle, setGameTitle] = useState(pkg.gameTitle ?? pkg.title);
  const [titleId, setTitleId] = useState(pkg.gameTitleId ?? "");
  const [platform, setPlatform] = useState(pkg.gamePlatform ?? "PS4");
  const [region, setRegion] = useState(pkg.gameRegion ?? "US");
  const [coverUrl, setCoverUrl] = useState(pkg.gameCoverUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [matchingCover, setMatchingCover] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: "var(--radius-sm)",
    fontSize: "var(--fs-md)",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "var(--color-text-primary)",
    outline: "none",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "var(--fs-xs)",
    fontWeight: 600,
    color: "var(--color-text-secondary)",
    marginBottom: 6,
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  const detectFromFilename = () => {
    const source = pkg.originalFilename || title;
    const detectedId = detectTitleId(source);
    const detectedTitle = cleanFilenameName(source);
    if (detectedId) setTitleId(detectedId);
    if (detectedTitle) {
      setTitle(detectedTitle);
      setGameTitle(detectedTitle);
    }
    setMessage(
      detectedId || detectedTitle
        ? "Filename parsed. Review the fields before saving."
        : "No useful filename metadata was detected.",
    );
    setError(null);
  };

  const matchCover = async () => {
    setMatchingCover(true);
    setError(null);
    setMessage(null);

    const params = new URLSearchParams();
    if (gameTitle.trim()) params.set("title", gameTitle.trim());
    if (titleId.trim()) params.set("titleId", titleId.trim());
    if (platform.trim()) params.set("platform", platform.trim());

    try {
      const res = await fetch(`/api/admin/pkgs/cover-suggest?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not search covers");
      if (data.match?.coverUrl) {
        setCoverUrl(data.match.coverUrl);
        setMessage(`Matched cover from ${data.match.title}`);
      } else {
        setMessage("No local cover match yet. Paste a cover URL manually.");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setMatchingCover(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/pkg/${pkg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          version: version.trim() || null,
          fwRequired: fwRequired.trim() || null,
          game: {
            title: gameTitle.trim() || title.trim(),
            titleId: titleId.trim() || null,
            platform: platform.trim() || null,
            region: region.trim() || null,
            coverUrl: coverUrl.trim() || null,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save metadata");

      setMessage("Saved.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="edit">
      <GlassCard variant="content" cornerRadius={16} padding="20px 24px">
        <div
          className="admin-editor-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "var(--fs-base)",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 4,
              }}
            >
              Edit metadata
            </h3>
            <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "var(--fs-sm)" }}>
              Update package data, game info, and cover image.
            </p>
          </div>
          <LiquidButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={detectFromFilename}
            iconLeft={<IconFile size={14} />}
          >
            Detect filename
          </LiquidButton>
        </div>

        <div
          className="admin-editor-grid"
          style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 210px", gap: 18 }}
        >
          <div
            className="admin-editor-fields"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, minWidth: 0 }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="edit-pkg-title" style={labelStyle}>
                Package title
              </label>
              <input
                id="edit-pkg-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="edit-pkg-description" style={labelStyle}>
                Description
              </label>
              <textarea
                id="edit-pkg-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
              />
            </div>
            <div>
              <label htmlFor="edit-pkg-version" style={labelStyle}>
                Version
              </label>
              <input
                id="edit-pkg-version"
                value={version}
                onChange={(event) => setVersion(event.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="edit-pkg-fw" style={labelStyle}>
                Min firmware
              </label>
              <input
                id="edit-pkg-fw"
                value={fwRequired}
                onChange={(event) => setFwRequired(event.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="edit-game-title" style={labelStyle}>
                Game title
              </label>
              <input
                id="edit-game-title"
                value={gameTitle}
                onChange={(event) => setGameTitle(event.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="edit-title-id" style={labelStyle}>
                Title ID
              </label>
              <input
                id="edit-title-id"
                value={titleId}
                onChange={(event) => setTitleId(event.target.value.toUpperCase())}
                style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
              />
            </div>
            <div>
              <label htmlFor="edit-platform" style={labelStyle}>
                Platform
              </label>
              <select
                id="edit-platform"
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
                style={inputStyle}
              >
                {platforms.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit-region" style={labelStyle}>
                Region
              </label>
              <select
                id="edit-region"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                style={inputStyle}
              >
                {regions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="edit-cover-url" style={labelStyle}>
                Cover URL
              </label>
              <div
                className="admin-cover-url-row"
                style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 8 }}
              >
                <input
                  id="edit-cover-url"
                  value={coverUrl}
                  onChange={(event) => setCoverUrl(event.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
                <LiquidButton
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={matchCover}
                  disabled={matchingCover}
                  iconLeft={matchingCover ? undefined : <IconRefresh size={14} />}
                >
                  {matchingCover ? "Matching..." : "Auto match"}
                </LiquidButton>
              </div>
            </div>
          </div>

          <div
            className="admin-cover-panel"
            style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}
          >
            <div
              className="admin-cover-preview"
              style={{
                aspectRatio: "3 / 4",
                borderRadius: "var(--radius-base)",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.035)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-text-muted)",
                fontSize: "var(--fs-sm)",
                textAlign: "center",
              }}
            >
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt="Game cover preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                "No cover"
              )}
            </div>
            {pkg.originalFilename && (
              <div
                style={{
                  fontSize: "var(--fs-xs)",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                  wordBreak: "break-all",
                }}
              >
                {pkg.originalFilename}
              </div>
            )}
          </div>
        </div>

        {(error || message) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 14,
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--fs-sm)",
              color: error ? "#fca5a5" : "#86efac",
              background: error ? "rgba(248,113,113,0.08)" : "rgba(52,211,153,0.08)",
              border: `1px solid ${error ? "rgba(248,113,113,0.2)" : "rgba(52,211,153,0.2)"}`,
            }}
          >
            {error ? <IconAlertTriangle size={14} /> : <IconCheck size={14} />}
            {error ?? message}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 14,
          }}
        >
          <LiquidButton type="button" variant="primary" size="md" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </LiquidButton>
        </div>
      </GlassCard>
    </div>
  );
}
