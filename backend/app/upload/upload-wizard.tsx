"use client";

import { GlassCard } from "@/components/liquid/glass";
import { IconCatalog, IconUpload, IconLink } from "@/components/ui/icons";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

type Step = "links" | "metadata" | "review";

interface SourceEntry {
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
  const [sources, setSources] = useState<SourceEntry[]>([{ url: "", label: "", valid: true }]);
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
      try { new URL(value); entry.valid = true; } catch { entry.valid = !value; }
    }
    next[i] = entry;
    setSources(next);
  };

  const addSource = () => {
    setSources([...sources, { url: "", label: "", valid: true }]);
  };

  const removeSource = (i: number) => {
    if (sources.length <= 1) return;
    setSources(sources.filter((_, idx) => idx !== i));
  };

  const validSources = sources.filter((s) => s.url.trim().length > 0);
  const canContinue = validSources.length >= 1;

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
          fontSize: "2rem",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--color-text-primary)",
          marginBottom: 4,
        }}
      >
        Share a PKG
      </h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: 24 }}>
        Submit an external download link. Packages are reviewed before publishing.
      </p>

      {/* Steps indicator */}
      <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
        {["Links", "Metadata", "Review"].map((s, i) => (
          <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background:
                  i <= stepIdx
                    ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                    : "rgba(255,255,255,0.06)",
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: i <= stepIdx ? "#818cf8" : "#475569",
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
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: 16,
                }}
              >
                Download Links
              </h3>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}
              >
                Paste links from GDrive, Mega, MediaFire, Archive.org, or any direct URL.
                Multiple mirrors welcome.
              </p>

              {sources.map((source, i) => (
                <div
                  key={i}
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
                          borderColor: source.url && !source.valid
                            ? "rgba(239, 68, 68, 0.5)"
                            : undefined,
                        }}
                      />
                      {source.url && source.valid && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            color: "#818cf8",
                            background: "rgba(99, 102, 241, 0.1)",
                            padding: "4px 8px",
                            borderRadius: 6,
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
                        style={{ flex: 1, fontSize: "0.8rem" }}
                      />
                      {sources.length > 1 && (
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => removeSource(i)}
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.75rem",
                            color: "#ef4444",
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
                  fontSize: "0.85rem",
                  width: "100%",
                  padding: "10px",
                  border: "1px dashed rgba(99,102,241,0.3)",
                  borderRadius: 8,
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
                  borderRadius: 8,
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                <span>🔗</span>
                <span>
                  {validSources.length} link{validSources.length !== 1 ? "s" : ""} added
                </span>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setStep("links")}
                  style={{ marginLeft: "auto", fontSize: "0.75rem", padding: "4px 10px" }}
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
                      fontSize: "0.7rem",
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
                      fontSize: "0.7rem",
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
                  <label
                    htmlFor="upload-platform"
                    style={{
                      display: "block",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Platform *
                  </label>
                  <select
                    id="upload-platform"
                    className="input"
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option>PS3</option>
                    <option>PS4</option>
                    <option>PS5</option>
                    <option>Vita</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="upload-region"
                    style={{
                      display: "block",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Region
                  </label>
                  <select
                    id="upload-region"
                    className="input"
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                  >
                    <option value="">—</option>
                    <option>US</option>
                    <option>EU</option>
                    <option>JP</option>
                    <option>ASIA</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="upload-firmware"
                    style={{
                      display: "block",
                      fontSize: "0.7rem",
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
                    fontSize: "0.7rem",
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
                  fontSize: "1.1rem",
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
                  fontSize: "0.85rem",
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
                        fontSize: "0.7rem",
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
                        fontSize: "0.9rem",
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
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: 20,
                  }}
                >
                  {form.description}
                </div>
              )}

              <h4
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: 8,
                }}
              >
                Download Links ({validSources.length})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                {validSources.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      fontSize: "0.8rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        color: "#818cf8",
                        background: "rgba(99, 102, 241, 0.1)",
                        padding: "2px 6px",
                        borderRadius: 4,
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
                        fontSize: "0.75rem",
                      }}
                    >
                      {s.url}
                    </span>
                    {s.label && (
                      <span style={{ color: "var(--color-text-secondary)", fontSize: "0.75rem" }}>
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
                    borderRadius: 8,
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    color: "#fca5a5",
                    fontSize: "0.85rem",
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
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: 10,
              }}
            >
              Supported sources
            </h4>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
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
                fontSize: "0.85rem",
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
                fontSize: "0.8rem",
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
