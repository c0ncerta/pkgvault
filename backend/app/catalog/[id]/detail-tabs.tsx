"use client";

import { GlassCard } from "@/components/liquid/glass";
import {
  IconCatalog,
  IconExternalLink,
  IconFile,
  IconHardDrive,
  IconLink,
  IconShield,
  IconUpload,
} from "@/components/ui/icons";
import { type ReactNode, useState } from "react";

interface Source {
  id: string;
  provider: string;
  label: string | null;
  status: string;
  isPrimary: boolean;
}

interface DetailTabsProps {
  description: string | null;
  sha256: string;
  originalFilename: string | null;
  sources: Source[];
  uploaderName: string | null;
  createdAt: string;
  downloadCount: number;
  version: string | null;
  fwRequired: string | null;
  sizeBytes: string;
}

type Tab = "overview" | "mirrors" | "integrity" | "history";

const PROVIDER_ICONS: Record<string, ReactNode> = {
  r2: <IconShield size={16} />,
  direct: <IconShield size={16} />,
  gdrive: <IconFile size={16} />,
  mega: <IconHardDrive size={16} />,
  mediafire: <IconHardDrive size={16} />,
  archive_org: <IconCatalog size={16} />,
  torrent: <IconLink size={16} />,
  onedrive: <IconHardDrive size={16} />,
  other: <IconLink size={16} />,
};

const PROVIDER_LABELS: Record<string, string> = {
  r2: "Direct (R2)",
  direct: "Direct",
  gdrive: "Google Drive",
  mega: "Mega.nz",
  mediafire: "MediaFire",
  archive_org: "Internet Archive",
  torrent: "Torrent",
  onedrive: "OneDrive",
  other: "Mirror",
};

export function DetailTabs(props: DetailTabsProps) {
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: Array<{ key: Tab; label: string; count?: number }> = [
    { key: "overview", label: "Overview" },
    { key: "mirrors", label: "Mirrors", count: props.sources.length },
    { key: "integrity", label: "Integrity" },
    { key: "history", label: "History" },
  ];

  return (
    <GlassCard padding="0" style={{ overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 6px",
        }}
      >
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              type="button"
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "14px 18px",
                border: "none",
                background: "transparent",
                color: active ? "var(--color-text-primary)" : "var(--color-text-muted)",
                fontSize: "0.85rem",
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
                position: "relative",
                fontFamily: "var(--font-sans)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span
                  style={{
                    fontSize: "0.65rem",
                    padding: "1px 7px",
                    borderRadius: 999,
                    background: active ? "var(--color-accent)" : "rgba(255,255,255,0.06)",
                    color: active ? "#fff" : "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                  }}
                >
                  {t.count}
                </span>
              )}
              {active && (
                <span
                  style={{
                    position: "absolute",
                    bottom: -1,
                    left: 12,
                    right: 12,
                    height: 2,
                    background: "linear-gradient(90deg, var(--color-accent), #a78bfa)",
                    borderRadius: 2,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div style={{ padding: 24, minHeight: 240 }}>
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {props.description ? (
              <div>
                <h3
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    marginBottom: 10,
                  }}
                >
                  Description
                </h3>
                <p
                  style={{
                    fontSize: "0.92rem",
                    color: "var(--color-text-primary)",
                    lineHeight: 1.65,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {props.description}
                </p>
              </div>
            ) : (
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-text-muted)",
                  fontStyle: "italic",
                }}
              >
                No description provided.
              </p>
            )}

            <div>
              <h3
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  marginBottom: 10,
                }}
              >
                Quick facts
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 10,
                }}
              >
                {[
                  { l: "Filename", v: props.originalFilename ?? "—" },
                  { l: "Version", v: props.version ?? "—" },
                  { l: "Min FW", v: props.fwRequired ? `≥ ${props.fwRequired}` : "—" },
                  { l: "Downloads", v: props.downloadCount.toLocaleString() },
                ].map((f) => (
                  <div
                    key={f.l}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--color-text-muted)",
                        marginBottom: 4,
                      }}
                    >
                      {f.l}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-primary)",
                        wordBreak: "break-word",
                      }}
                    >
                      {f.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "mirrors" &&
          (props.sources.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {props.sources.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid ${s.status === "alive" ? "rgba(52,211,153,0.18)" : "rgba(255,255,255,0.05)"}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.1rem",
                      width: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {PROVIDER_ICONS[s.provider] ?? <IconLink size={16} />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {s.label ?? PROVIDER_LABELS[s.provider] ?? s.provider}
                      {s.isPrimary && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: "0.6rem",
                            padding: "1px 6px",
                            borderRadius: 999,
                            background: "var(--color-accent)",
                            color: "#fff",
                            letterSpacing: "0.05em",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          primary
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-mono)",
                        marginTop: 2,
                      }}
                    >
                      {PROVIDER_LABELS[s.provider] ?? s.provider}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background:
                        s.status === "alive" ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)",
                      color:
                        s.status === "alive" ? "var(--color-success)" : "var(--color-text-muted)",
                    }}
                  >
                    {s.status === "alive" ? "✓ alive" : s.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
                textAlign: "center",
                padding: 24,
              }}
            >
              No mirrors available.
            </p>
          ))}

        {tab === "integrity" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {props.sha256 === "external" ? (
              <div
                style={{
                  padding: 20,
                  borderRadius: 12,
                  background: "rgba(99, 102, 241, 0.05)",
                  border: "1px solid rgba(99, 102, 241, 0.12)",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                This package uses an external download link. SHA-256 verification is not available.
                Verify the file manually after downloading.
              </div>
            ) : (
              <>
                <div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      marginBottom: 8,
                    }}
                  >
                    SHA-256
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.78rem",
                      lineHeight: 1.6,
                      padding: 14,
                      borderRadius: 12,
                      background: "rgba(0,0,0,0.25)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      wordBreak: "break-all",
                      color:
                        props.sha256 === "pending"
                          ? "var(--color-warning)"
                          : "var(--color-success)",
                    }}
                  >
                    {props.sha256}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.55,
                  }}
                >
                  <strong style={{ color: "var(--color-text-primary)" }}>How to verify:</strong>{" "}
                  after downloading, run
                  <code
                    style={{
                      display: "inline-block",
                      margin: "0 4px",
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.05)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                    }}
                  >
                    sha256sum {props.originalFilename ?? "<file>"}
                  </code>
                  and compare. They must match exactly.
                </div>
              </>
            )}
          </div>
        )}

        {tab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                icon: <IconUpload size={16} />,
                label: "Uploaded",
                value: props.createdAt.replace("T", " ").slice(0, 16),
                sub: `by @${props.uploaderName ?? "unknown"}`,
              },
              {
                icon: <IconCatalog size={16} />,
                label: "Size",
                value: Number(props.sizeBytes) > 0 ? `${Number(props.sizeBytes).toLocaleString()} bytes` : "—",
                sub: undefined,
              },
              {
                icon: <IconExternalLink size={16} />,
                label: "Downloads",
                value: props.downloadCount.toLocaleString(),
                sub: undefined,
              },
            ].map((e) => (
              <div
                key={e.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span
                  style={{
                    width: 24,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {e.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {e.label}
                  </div>
                  <div
                    style={{
                      fontSize: "0.88rem",
                      color: "var(--color-text-primary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {e.value}
                  </div>
                  {e.sub && (
                    <div
                      style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: 2 }}
                    >
                      {e.sub}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
