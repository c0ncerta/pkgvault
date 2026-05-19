"use client";

import { LiquidButton } from "@/components/ui/liquid-button";
import { useCallback, useEffect, useState } from "react";

interface DownloadButtonProps {
  pkgId: string;
  size: string;
  rootzUrl: string | null;
}

function ProviderButton({
  icon,
  gradient,
  label,
  subtitle,
  onClick,
  loading,
  disabled,
}: {
  icon: string;
  gradient: string;
  label: string;
  subtitle: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 20px",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        cursor: disabled ? "not-allowed" : loading ? "wait" : "pointer",
        transition: "background 0.15s, border-color 0.15s",
        opacity: disabled ? 0.4 : 1,
        width: "100%",
        textAlign: "left" as const,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.3rem",
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {loading ? (
          <span style={{ animation: "pulse-dot 1s ease-in-out infinite" }}>◓</span>
        ) : (
          icon
        )}
      </span>
      <div>
        <div
          style={{
            fontSize: "0.92rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>{subtitle}</div>
      </div>
    </button>
  );
}

export function DownloadButton({ pkgId, size, rootzUrl }: DownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<"gdrive" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const handleGDrive = useCallback(async () => {
    setLoading("gdrive");
    setError(null);
    try {
      const res = await fetch(`/api/pkg/${pkgId}/download`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Download failed");
        return;
      }
      const { downloadUrl } = await res.json();
      window.open(downloadUrl, "_blank");
      setOpen(false);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(null);
    }
  }, [pkgId]);

  const handleRootz = useCallback(() => {
    if (rootzUrl) {
      window.open(rootzUrl, "_blank");
      setOpen(false);
    }
  }, [rootzUrl]);

  return (
    <>
      <LiquidButton
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => setOpen(true)}
        iconLeft="↓"
      >
        {`Download · ${size}`}
      </LiquidButton>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            background: "rgba(0, 0, 0, 0.55)",
            animation: "modal-fade-in 0.2s ease-out",
          }}
        >
          <div
            style={{
              background: "rgba(20, 22, 28, 0.92)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 24,
              padding: "32px 28px 28px",
              width: "min(420px, 90vw)",
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
              animation: "modal-scale-in 0.2s ease-out",
            }}
          >
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              Choose download source
            </h2>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--color-text-muted)",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              {size}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ProviderButton
                icon="G"
                gradient="linear-gradient(135deg, #4285F4, #34A853)"
                label="Google Drive"
                subtitle={
                  loading === "gdrive" ? "Generating link…" : "Download via Google Drive"
                }
                onClick={handleGDrive}
                loading={loading === "gdrive"}
              />
              <ProviderButton
                icon="R"
                gradient="linear-gradient(135deg, #FF6B35, #F7C948)"
                label="Rootz"
                subtitle={rootzUrl ? "Download via Rootz.so" : "Not available for this PKG"}
                onClick={handleRootz}
                disabled={!rootzUrl}
              />
            </div>

            {error && (
              <div
                style={{
                  marginTop: 14,
                  fontSize: "0.78rem",
                  color: "var(--color-danger)",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                marginTop: 18,
                width: "100%",
                padding: "10px",
                borderRadius: 12,
                border: "none",
                background: "transparent",
                color: "var(--color-text-muted)",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
