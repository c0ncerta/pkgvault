"use client";

import { GlassPanel } from "@/components/liquid/glass";
import { IconCloud, IconDownload, IconLink, IconX } from "@/components/ui/icons";
import { LiquidButton } from "@/components/ui/liquid-button";
import { WebtorEmbed } from "@/components/ui/webtor-embed";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Source {
  id: string;
  provider: string;
  url: string;
  label: string | null;
  status: string;
  isPrimary: boolean;
  seederCount?: number;
  leecherCount?: number;
}

interface DownloadButtonProps {
  pkgId: string;
  size: string;
  sources: Source[];
}

const PROVIDER_META: Record<string, { label: string; subtitle: string }> = {
  gdrive: { label: "Google Drive", subtitle: "Download via Google Drive" },
  direct: { label: "Direct", subtitle: "Direct download" },
  r2: { label: "Direct", subtitle: "Direct download" },
  archive_org: { label: "Internet Archive", subtitle: "Download via archive.org" },
  mega: { label: "Mega.nz", subtitle: "Download via MEGA" },
  mediafire: { label: "MediaFire", subtitle: "Download via MediaFire" },
  onedrive: { label: "OneDrive", subtitle: "Download via OneDrive" },
  torrent: { label: "Torrent", subtitle: "Stream or download in your browser" },
  other: { label: "Mirror", subtitle: "External mirror" },
};

function metaFor(source: Source): { label: string; subtitle: string } {
  // Friendly special-case for the Rootz mirror.
  if (source.provider !== "torrent" && /rootz/i.test(source.url)) {
    return { label: "Rootz", subtitle: "Download via Rootz" };
  }
  return PROVIDER_META[source.provider] ?? { label: "Mirror", subtitle: "External mirror" };
}

function iconFor(provider: string): ReactNode {
  if (provider === "gdrive") return <IconCloud size={19} />;
  if (provider === "torrent") return <IconDownload size={19} />;
  return <IconLink size={19} />;
}

function ProviderButton({
  icon,
  label,
  subtitle,
  badge,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  subtitle: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.045] p-3.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.075]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] border border-white/10 bg-white/[0.07] text-accent-hover shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition duration-200 group-hover:bg-white/[0.1]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[0.92rem] font-semibold text-text-primary">
          {label}
          {badge && (
            <span className="rounded-full bg-success-bright/15 px-2 py-0.5 font-mono text-[0.6rem] font-bold text-success-bright">
              {badge}
            </span>
          )}
        </div>
        <div className="mt-0.5 text-xs text-text-muted">{subtitle}</div>
      </div>
    </button>
  );
}

export function DownloadButton({ pkgId, size, sources }: DownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "webtor">("list");
  const [activeMagnet, setActiveMagnet] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Primary first; torrents bubble up (purest mirror), then the rest.
  const ordered = [...sources].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    const rank = (s: Source) => (s.provider === "torrent" ? 0 : 1);
    return rank(a) - rank(b);
  });

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

  const close = useCallback(() => {
    setOpen(false);
    setView("list");
    setActiveMagnet(null);
    setCopied(false);
  }, []);

  // Fire-and-forget: keep the download counters ticking without blocking the user.
  const bumpCounter = useCallback(() => {
    fetch(`/api/pkg/${pkgId}/download`, { method: "POST" }).catch(() => {});
  }, [pkgId]);

  const handleSource = useCallback(
    (source: Source) => {
      if (source.provider === "torrent") {
        setActiveMagnet(source.url);
        setView("webtor");
        bumpCounter();
        return;
      }
      window.open(source.url, "_blank", "noopener,noreferrer");
      bumpCounter();
      close();
    },
    [bumpCounter, close],
  );

  const copyMagnet = useCallback(() => {
    if (!activeMagnet) return;
    navigator.clipboard?.writeText(activeMagnet).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  }, [activeMagnet]);

  const modal =
    open &&
    createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        <button
          type="button"
          aria-label="Close download dialog"
          className="absolute inset-0 cursor-default border-0 bg-[rgba(0,0,0,0.58)] backdrop-blur-md"
          onClick={close}
        />

        {/* biome-ignore lint/a11y/useSemanticElements: mirrors the app modal pattern */}
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
                  {view === "webtor" ? "Torrent" : "Download"}
                </div>
                <h2
                  id="download-modal-title"
                  className="truncate text-base font-bold tracking-[-0.02em] text-text-primary"
                >
                  {view === "webtor" ? "Streaming in your browser" : "Choose source"}
                </h2>
                <p className="mt-1 text-xs text-text-muted">
                  {view === "webtor" ? "Served by webtor — nothing is hosted here" : `${size}`}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close download dialog"
                onClick={close}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-text-muted transition duration-200 hover:border-white/20 hover:bg-white/[0.085] hover:text-text-primary"
              >
                <IconX size={17} />
              </button>
            </div>

            {view === "list" ? (
              <div className="flex max-h-[60vh] flex-col gap-2.5 overflow-y-auto px-5 py-4">
                {ordered.length === 0 && (
                  <div className="rounded-[0.9rem] border border-white/10 bg-white/[0.03] px-3 py-4 text-center text-xs text-text-muted">
                    No download sources available yet.
                  </div>
                )}
                {ordered.map((source) => {
                  const meta = metaFor(source);
                  const seeders =
                    source.provider === "torrent" && typeof source.seederCount === "number"
                      ? `${source.seederCount} seed`
                      : undefined;
                  return (
                    <ProviderButton
                      key={source.id}
                      icon={iconFor(source.provider)}
                      label={meta.label}
                      subtitle={source.label ?? meta.subtitle}
                      badge={seeders}
                      onClick={() => handleSource(source)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-3 px-5 py-4">
                {activeMagnet && <WebtorEmbed magnet={activeMagnet} />}

                <div className="rounded-[0.9rem] border border-white/10 bg-white/[0.03] p-3">
                  <div className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-text-muted">
                    Prefer your own client?
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={copyMagnet}
                      className="flex-1 rounded-[0.8rem] border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-text-primary transition hover:bg-white/[0.08]"
                    >
                      {copied ? "Copied ✓" : "Copy magnet"}
                    </button>
                    <a
                      href={activeMagnet ?? "#"}
                      className="flex-1 rounded-[0.8rem] border border-white/10 bg-white/[0.05] px-3 py-2 text-center text-xs font-semibold text-text-primary transition hover:bg-white/[0.08]"
                    >
                      Open in client
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="text-center text-xs text-text-muted transition hover:text-text-primary"
                >
                  ← Back to sources
                </button>
              </div>
            )}
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
