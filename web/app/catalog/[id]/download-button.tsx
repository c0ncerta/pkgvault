"use client";

import { GlassPanel } from "@/components/liquid/glass";
import { IconCloud, IconDownload, IconLink, IconX } from "@/components/ui/icons";
import { LiquidButton } from "@/components/ui/liquid-button";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DownloadButtonProps {
  pkgId: string;
  size: string;
  rootzUrl: string | null;
}

function ProviderButton({
  icon,
  label,
  subtitle,
  onClick,
  loading,
  disabled,
}: {
  icon: ReactNode;
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
      className="group flex w-full items-center gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.045] p-3.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.075] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-white/10 bg-white/[0.07] text-accent-hover shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition duration-200 group-hover:bg-white/[0.1]">
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
        ) : (
          icon
        )}
      </span>
      <div className="min-w-0">
        <div className="text-[0.92rem] font-semibold text-text-primary">{label}</div>
        <div className="mt-0.5 text-xs text-text-muted">{subtitle}</div>
      </div>
    </button>
  );
}

export function DownloadButton({ pkgId, size, rootzUrl }: DownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<"gdrive" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
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

  const modal =
    open &&
    createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        <button
          type="button"
          aria-label="Close download source dialog"
          className="absolute inset-0 cursor-default border-0 bg-[rgba(0,0,0,0.58)] backdrop-blur-md"
          onClick={() => setOpen(false)}
        />

        {/* biome-ignore lint/a11y/useSemanticElements: Native dialog was the source of the broken backdrop behavior; this mirrors the app modal pattern from apuesta. */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="download-modal-title"
          className="relative w-full max-w-md animate-[modal-scale-in_var(--dur-base)_ease-out]"
        >
          <GlassPanel
            variant="strong"
            cornerRadius={30}
            padding="0"
            className="overflow-hidden"
            style={{
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.52), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  <IconDownload size={13} />
                  Download
                </div>
                <h2
                  id="download-modal-title"
                  className="truncate text-base font-bold tracking-[-0.02em] text-text-primary"
                >
                  Choose source
                </h2>
                <p className="mt-1 text-xs text-text-muted">{size} · opens in a new tab</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close download source dialog"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-text-muted transition duration-200 hover:border-white/20 hover:bg-white/[0.085] hover:text-text-primary"
              >
                <IconX size={17} />
              </button>
            </div>

            <div className="flex max-h-[60vh] flex-col gap-2.5 overflow-y-auto px-5 py-4">
              <ProviderButton
                icon={<IconCloud size={19} />}
                label="Google Drive"
                subtitle={loading === "gdrive" ? "Generating link..." : "Download via Google Drive"}
                onClick={handleGDrive}
                loading={loading === "gdrive"}
              />
              <ProviderButton
                icon={<IconLink size={19} />}
                label="Rootz"
                subtitle={rootzUrl ? "Download via Rootz.so" : "Not available for this PKG"}
                onClick={handleRootz}
                disabled={!rootzUrl}
              />

              {error && (
                <div className="mt-1 rounded-[0.9rem] border border-danger/25 bg-danger/10 px-3 py-2.5 text-center text-xs text-danger">
                  {error}
                </div>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>,
      document.body,
    );

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

      {modal}
    </>
  );
}
