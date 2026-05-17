"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/liquid/glass";
import { IconUpload, IconCatalog } from "@/components/ui/icons";

type Step = "file" | "metadata" | "review";

interface FormData {
  title: string;
  version: string;
  platform: string;
  region: string;
  fwRequired: string;
  description: string;
  tags: string[];
}

const emptyForm: FormData = { title: "", version: "", platform: "", region: "", fwRequired: "", description: "", tags: [] };

const validations = [
  { label: ".pkg extension", check: (f: File | null) => f?.name.endsWith(".pkg") ?? false },
  { label: "size ≤ 20 GB", check: (f: File | null) => (f?.size ?? Infinity) <= 20_000_000_000 },
  { label: "title required", check: (_f: File | null, d: FormData) => d.title.length >= 2 },
  { label: "version format", check: (_f: File | null, d: FormData) => /^\d+\.\d+/.test(d.version) || !d.version },
  { label: "platform selected", check: (_f: File | null, d: FormData) => !!d.platform },
];

export function UploadWizard() {
  const [step, setStep] = useState<Step>("file");
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const steps: Step[] = ["file", "metadata", "review"];
  const stepIdx = steps.indexOf(step);

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith(".pkg")) { setError("Only .pkg files are allowed"); return; }
    if (f.size > 20_000_000_000) { setError("Max file size is 20 GB"); return; }
    setFile(f);
    setError(null);
    // Auto-fill title from filename
    const name = f.name.replace(/\.pkg$/i, "").replace(/_/g, " ");
    setForm((prev) => ({ ...prev, title: prev.title || name }));
    setStep("metadata");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true); setError(null); setProgress(0);

    try {
      // 1. Get presigned URL
      const res = await fetch("/api/pkg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          version: form.version || undefined,
          fwRequired: form.fwRequired || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create upload");
      }

      const { fileId, uploadUrl } = await res.json();

      // 2. Upload to R2
      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`));
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });

      setProgress(100);

      // 3. Confirm
      await fetch("/api/pkg/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, sha256: "client-pending" }),
      });

      router.push(`/catalog/${fileId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    return `${(bytes / 1e3).toFixed(0)} KB`;
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-text-primary)", marginBottom: 4 }}>
        Upload PKG
      </h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: 24 }}>
        Files are reviewed by moderators before publishing. Max 20 GB.
      </p>

      {/* Steps indicator */}
      <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
        {["File", "Metadata", "Review"].map((s, i) => (
          <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{
              height: 4, borderRadius: 2,
              background: i <= stepIdx ? "linear-gradient(90deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.06)",
            }} />
            <span style={{
              fontSize: "0.75rem", fontWeight: 600,
              color: i <= stepIdx ? "#818cf8" : "#475569",
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}>{i + 1}. {s}</span>
          </div>
        ))}
      </div>

      <div className="responsive-upload-layout" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        {/* Main area */}
        <div>
          {step === "file" && (
            <GlassCard
              padding="48px"
              onClick={() => inputRef.current?.click()}
              style={{
                textAlign: "center", cursor: "pointer",
                border: `2px dashed ${dragOver ? "var(--color-accent)" : "rgba(99, 102, 241, 0.2)"}`,
                background: dragOver ? "rgba(99, 102, 241, 0.04)" : undefined,
                transition: "border-color 0.2s, background 0.2s",
              }}
            >
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input ref={inputRef} type="file" accept=".pkg" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                <div style={{ fontSize: "3rem", marginBottom: 12, opacity: 0.4 }}><IconUpload size={48} /></div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>Drop your .pkg file here</h3>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: 16 }}>or click to browse — max 20 GB</p>
                <span className="btn-primary">Choose File</span>
              </div>
            </GlassCard>
          )}

          {step === "metadata" && (
            <GlassCard padding="24px">
              {file && (
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 10, marginBottom: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: "1.5rem", display: "flex", alignItems: "center" }}><IconCatalog size={24} /></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{file.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>{formatSize(file.size)}</div>
                  </div>
                  <button className="btn-ghost" onClick={() => { setFile(null); setStep("file"); }}>Change</button>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Title *</label>
                  <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. BloodGarden" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Version *</label>
                  <input className="input" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="e.g. 1.04" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Platform *</label>
                  <select className="input" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                    <option value="">Select</option>
                    <option>PS3</option><option>PS4</option><option>PS5</option><option>Vita</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Region</label>
                  <select className="input" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                    <option value="">—</option>
                    <option>US</option><option>EU</option><option>JP</option><option>ASIA</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Min Firmware</label>
                  <input className="input" value={form.fwRequired} onChange={(e) => setForm({ ...form, fwRequired: e.target.value })} placeholder="e.g. 9.00" />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
                <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional…" style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="btn-ghost" onClick={() => setStep("file")}>← Back</button>
                <button className="btn-primary" onClick={() => setStep("review")} disabled={!form.title || !form.platform}>Review →</button>
              </div>
            </GlassCard>
          )}

          {step === "review" && (
            <GlassCard padding="24px">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 16 }}>Review & Submit</h3>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 20px", fontSize: "0.85rem", marginBottom: 20 }}>
                {[
                  ["File", file?.name ?? "—"],
                  ["Size", file ? formatSize(file.size) : "—"],
                  ["Title", form.title],
                  ["Version", form.version || "—"],
                  ["Platform", form.platform],
                  ["Region", form.region || "—"],
                  ["Min FW", form.fwRequired || "—"],
                ].map(([k, v]) => (
                  <><dt style={{ color: "var(--color-text-muted)", fontWeight: 500, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.04em" }}>{k}</dt>
                  <dd style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", margin: 0 }}>{v}</dd></>
                ))}
              </div>
              {form.description && (
                <div style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: 20 }}>
                  {form.description}
                </div>
              )}

              {/* Progress bar */}
              {uploading && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: 4, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                    <span>{progress}%</span>
                    <span>{file ? `${formatSize(file.size * progress / 100)} / ${formatSize(file.size)}` : ""}</span>
                  </div>
                </div>
              )}

              {error && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#fca5a5", fontSize: "0.85rem", marginBottom: 16 }}>{error}</div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="btn-ghost" onClick={() => setStep("metadata")} disabled={uploading}>← Back</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={uploading} style={{ opacity: uploading ? 0.6 : 1 }}>
                  {uploading ? "Uploading…" : "Submit for Review →"}
                </button>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Sidebar — Validations */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GlassCard padding="16px">
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 10 }}>Validations</h4>
            {validations.map((v) => {
              const ok = v.check(file, form);
              return (
                <div key={v.label} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: "0.8rem" }}>
                  <span style={{ color: ok ? "var(--color-success)" : "#475569", fontFamily: "var(--font-mono)" }}>{ok ? "✓" : "·"}</span>
                  <span style={{ color: ok ? "#e8e8ed" : "#64748b" }}>{v.label}</span>
                </div>
              );
            })}
          </GlassCard>
          <GlassCard padding="16px">
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 8 }}>What happens next?</h4>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              <li>File uploaded to storage</li>
              <li>SHA-256 hash computed</li>
              <li>Status set to <strong>pending</strong></li>
              <li>Admin reviews (24-48h)</li>
              <li>Published to catalog ✓</li>
            </ol>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
