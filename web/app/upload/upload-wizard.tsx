"use client";

import { GlassCard } from "@/components/liquid/glass";
import { IconLink } from "@/components/ui/icons";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Step = "links" | "metadata" | "review";

interface SourceEntry {
  id: string;
  url: string;
  label: string;
  valid: boolean;
}

interface FormData {
  title: string;
  version: string;
  platform: string;
  region: string;
  fwRequired: string;
  description: string;
}

const emptyForm: FormData = {
  title: "",
  version: "",
  platform: "",
  region: "",
  fwRequired: "",
  description: "",
};

export function UploadWizard() {
  const [step, setStep] = useState<Step>("links");
  const nextSourceId = useRef(1);
  const [sources, setSources] = useState<SourceEntry[]>([
    { id: "source-0", url: "", label: "", valid: true },
  ]);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const steps: Step[] = ["links", "metadata", "review"];
  const stepIdx = steps.indexOf(step);

  const updateSource = (i: number, field: keyof SourceEntry, value: string) => {
    const next = [...sources];
    const entry = { ...next[i], [field]: value } as SourceEntry;
    if (field === "url") {
      try {
        new URL(value);
        entry.valid = true;
      } catch {
        entry.valid = !value;
      }
    }
    next[i] = entry;
    setSources(next);
  };

  const addSource = () => {
    const id = `source-${nextSourceId.current}`;
    nextSourceId.current += 1;
    setSources([...sources, { id, url: "", label: "", valid: true }]);
  };

  const removeSource = (i: number) => {
    if (sources.length <= 1) return;
    setSources(sources.filter((_, idx) => idx !== i));
  };

  const validSources = sources.filter((s) => s.url.trim().length > 0 && s.valid);
  const hasInvalidSource = sources.some((s) => s.url.trim().length > 0 && !s.valid);
  const canContinue = validSources.length >= 1 && !hasInvalidSource;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/pkg/source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          version: form.version || undefined,
          fwRequired: form.fwRequired || undefined,
          platform: form.platform || undefined,
          region: form.region || undefined,
          sources: validSources.map((s) => ({
            url: s.url.trim(),
            label: s.label.trim() || undefined,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to submit package");
      }

      const { fileId } = await res.json();
      router.push(`/catalog/${fileId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const providerIcon = (url: string) => {
    try {
      const host = new URL(url).hostname.toLowerCase();
      if (host.includes("drive.google")) return "GDrive";
      if (host.includes("mega")) return "MEGA";
      if (host.includes("mediafire")) return "MF";
      if (host.includes("archive")) return "IA";
      if (url.startsWith("magnet:")) return "Torrent";
      return "Link";
    } catch {
      return "Link";
    }
  };

  return (
    <div className="animate-fade-in">
      <h1
        style={{
          fontSize: "var(--fs-5xl)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--color-text-primary)",
          marginBottom: 4,
        }}
      >
        Share a PKG
      </h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: "var(--fs-lg)", marginBottom: 24 }}>
        Submit an external download link. Packages are reviewed before publishing.
      </p>

      {/* Steps indicator */}
      <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
        {["Links", "Metadata", "Review"].map((s, i) => (
          <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                height: 4,
                borderRadius: "var(--radius-2xs)",
                background:
                  i <= stepIdx
                    ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                    : "rgba(255,255,255,0.06)",
              }}
            />
            <span
              style={{
                fontSize: "var(--fs-sm)",
                fontWeight: 600,
                color: i <= stepIdx ? "var(--color-accent-hover)" : "var(--color-text-faint)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {i + 1}. {s}
            </span>
          </div>
        ))}
      </div>

      <div
        className="responsive-upload-layout"
        style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}
      >
        {/* Main area */}
        <div>
          {step === "links" && (
            <GlassCard padding="24px">
              <h3
                style={{
                  fontSize: "var(--fs-xl)",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: 16,
                }}
              >
                Download Links
              </h3>
              <p
                style={{
                  fontSize: "var(--fs-base)",
                  color: "var(--color-text-muted)",
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}
              >
                Paste links from GDrive, Mega, MediaFire, Archive.org, or any direct URL. Multiple
                mirrors welcome.
              </p>

              {sources.map((source, i) => (
                <div
                  key={source.id}
                  style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <input
                        className="input"
                        value={source.url}
                        onChange={(e) => updateSource(i, "url", e.target.value)}
                        placeholder="https://drive.google.com/file/d/..."
                        style={{
                          flex: 1,
                          borderColor:
                            source.url && !source.valid ? "rgba(239, 68, 68, 0.5)" : undefined,
                        }}
                      />
                      {source.url && source.valid && (
                        <span
                          style={{
                            fontSize: "var(--fs-2xs)",
                            fontWeight: 700,
                            color: "var(--color-accent-hover)",
                            background: "rgba(99, 102, 241, 0.1)",
                            padding: "4px 8px",
                            borderRadius: "var(--radius-xs)",
                            whiteSpace: "nowrap",
                            marginTop: 8,
                          }}
                        >
                          {providerIcon(source.url)}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="input"
                        value={source.label}
                        onChange={(e) => updateSource(i, "label", e.target.value)}
                        placeholder="Label (e.g. Mirror EU)"
                        style={{ flex: 1, fontSize: "var(--fs-base)" }}
                      />
                      {sources.length > 1 && (
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => removeSource(i)}
                          style={{
                            padding: "6px 12px",
                            fontSize: "var(--fs-sm)",
                            color: "var(--color-danger)",
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn-ghost"
                onClick={addSource}
                style={{
                  marginTop: 4,
                  fontSize: "var(--fs-md)",
                  width: "100%",
                  padding: "10px",
                  border: "1px dashed rgba(99,102,241,0.3)",
                  borderRadius: "var(--radius-xs)",
                }}
              >
                + Add another link
              </button>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setStep("metadata")}
                  disabled={!canContinue}
                >
                  Next: Metadata →
                </button>
              </div>
            </GlassCard>
          )}

          {step === "metadata" && (
            <GlassCard padding="24px">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                  padding: "8px 12px",
                  background: "rgba(99, 102, 241, 0.08)",
                  borderRadius: "var(--radius-xs)",
                  fontSize: "var(--fs-base)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <IconLink size={14} />
                <span>
                  {validSources.length} link{validSources.length !== 1 ? "s" : ""} added
                </span>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setStep("links")}
                  style={{ marginLeft: "auto", fontSize: "var(--fs-sm)", padding: "4px 10px" }}
                >
                  Edit
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label
                    htmlFor="upload-title"
                    style={{
                      display: "block",
                      fontSize: "var(--fs-xs)",
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Title *
                  </label>
                  <input
                    id="upload-title"
                    className="input"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. BloodGarden"
                  />
                </div>
                <div>
                  <label
                    htmlFor="upload-version"
                    style={{
                      display: "block",
                      fontSize: "var(--fs-xs)",
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Version
                  </label>
                  <input
                    id="upload-version"
                    className="input"
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                    placeholder="e.g. 1.04"
                  />
                </div>
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "var(--fs-xs)",
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Platform *
                  </span>
                  <div
                    className="segmented-shell"
                    style={{ width: "100%", display: "flex", justifyContent: "stretch" }}
                  >
                    {["PS3", "PS4", "PS5", "Vita"].map((platform) => (
                      <button
                        type="button"
                        key={platform}
                        className="segmented-pill"
                        data-active={form.platform === platform}
                        style={{ flex: 1 }}
                        onClick={() => setForm({ ...form, platform })}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "var(--fs-xs)",
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Region
                  </span>
                  <div
                    className="segmented-shell"
                    style={{ width: "100%", display: "flex", justifyContent: "stretch" }}
                  >
                    {[
                      { value: "", label: "—" },
                      { value: "US", label: "US" },
                      { value: "EU", label: "EU" },
                      { value: "JP", label: "JP" },
                      { value: "ASIA", label: "ASIA" },
                    ].map((region) => (
                      <button
                        type="button"
                        key={region.value}
                        className="segmented-pill"
                        data-active={form.region === region.value}
                        style={{ flex: 1 }}
                        onClick={() => setForm({ ...form, region: region.value })}
                      >
                        {region.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="upload-firmware"
                    style={{
                      display: "block",
                      fontSize: "var(--fs-xs)",
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Min Firmware
                  </label>
                  <input
                    id="upload-firmware"
                    className="input"
                    value={form.fwRequired}
                    onChange={(e) => setForm({ ...form, fwRequired: e.target.value })}
                    placeholder="e.g. 9.00"
                  />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label
                  htmlFor="upload-description"
                  style={{
                    display: "block",
                    fontSize: "var(--fs-xs)",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Description
                </label>
                <textarea
                  id="upload-description"
                  className="input"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional…"
                  style={{ resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="button" className="btn-ghost" onClick={() => setStep("links")}>
                  ← Back
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setStep("review")}
                  disabled={!form.title || !form.platform}
                >
                  Review →
                </button>
              </div>
            </GlassCard>
          )}

          {step === "review" && (
            <GlassCard padding="24px">
              <h3
                style={{
                  fontSize: "var(--fs-2xl)",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: 16,
                }}
              >
                Review & Submit
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "8px 20px",
                  fontSize: "var(--fs-md)",
                  marginBottom: 20,
                }}
              >
                {[
                  ["Title", form.title],
                  ["Version", form.version || "—"],
                  ["Platform", form.platform],
                  ["Region", form.region || "—"],
                  ["Min FW", form.fwRequired || "—"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "contents" }}>
                    <dt
                      style={{
                        color: "var(--color-text-muted)",
                        fontSize: "var(--fs-xs)",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {k}
                    </dt>
                    <dd
                      style={{
                        margin: 0,
                        color: "var(--color-text-primary)",
                        fontSize: "var(--fs-lg)",
                        fontWeight: 500,
                      }}
                    >
                      {v}
                    </dd>
                  </div>
                ))}
              </div>

              {form.description && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: "var(--radius-xs)",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    fontSize: "var(--fs-md)",
                    color: "var(--color-text-secondary)",
                    marginBottom: 20,
                  }}
                >
                  {form.description}
                </div>
              )}

              <h4
                style={{
                  fontSize: "var(--fs-base)",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: 8,
                }}
              >
                Download Links ({validSources.length})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                {validSources.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: "var(--radius-xs)",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      fontSize: "var(--fs-base)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--fs-2xs)",
                        fontWeight: 700,
                        color: "var(--color-accent-hover)",
                        background: "rgba(99, 102, 241, 0.1)",
                        padding: "2px 6px",
                        borderRadius: "var(--radius-2xs)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {providerIcon(s.url)}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--fs-sm)",
                      }}
                    >
                      {s.url}
                    </span>
                    {s.label && (
                      <span
                        style={{ color: "var(--color-text-secondary)", fontSize: "var(--fs-sm)" }}
                      >
                        {s.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-xs)",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    color: "var(--color-danger-soft)",
                    fontSize: "var(--fs-md)",
                    marginBottom: 16,
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setStep("metadata")}
                  disabled={submitting}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? "Submitting…" : "Submit for Review →"}
                </button>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GlassCard padding="16px">
            <h4
              style={{
                fontSize: "var(--fs-md)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: 10,
              }}
            >
              Supported sources
            </h4>
            <div
              style={{
                fontSize: "var(--fs-base)",
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
              }}
            >
              <div>✓ Google Drive</div>
              <div>✓ Mega</div>
              <div>✓ MediaFire</div>
              <div>✓ Archive.org</div>
              <div>✓ Direct HTTP/HTTPS</div>
              <div>✓ Magnet / Torrent</div>
              <div>✓ OneDrive</div>
              <div>✓ Custom links</div>
            </div>
          </GlassCard>
          <GlassCard padding="16px">
            <h4
              style={{
                fontSize: "var(--fs-md)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: 8,
              }}
            >
              What happens next?
            </h4>
            <ol
              style={{
                margin: 0,
                paddingLeft: 18,
                fontSize: "var(--fs-base)",
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
              }}
            >
              <li>Package info saved</li>
              <li>Links verified by mods</li>
              <li>Status set to pending</li>
              <li>Admin reviews (24-48h)</li>
              <li>Published to catalog ✓</li>
            </ol>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
