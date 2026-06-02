"use client";

import { GlassCard, GlassPanel } from "@/components/liquid/glass";
import {
  IconAlertTriangle,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconX,
} from "@/components/ui/icons";
import { LiquidButton } from "@/components/ui/liquid-button";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type SourceStatus = "alive" | "dead" | "unknown" | "checking";
type FilterStatus = SourceStatus | "all";

export type LinkHealthSource = {
  id: string;
  url: string;
  provider: string;
  status: SourceStatus;
  label: string | null;
  isPrimary: boolean;
  failCount: number;
  downloadCount: number;
  lastCheckedAt: string | null;
  createdAt: string;
  pkgTitle: string;
  pkgId: string;
};

const statusConfig: Record<SourceStatus, { color: string; label: string }> = {
  alive: { color: "#34d399", label: "Alive" },
  dead: { color: "#f87171", label: "Dead" },
  unknown: { color: "var(--color-text-muted)", label: "Unknown" },
  checking: { color: "#fbbf24", label: "Checking" },
};

const providerLabels: Record<string, string> = {
  r2: "Cloudflare R2",
  direct: "Direct URL",
  gdrive: "Google Drive",
  mega: "Mega.nz",
  mediafire: "MediaFire",
  archive_org: "Internet Archive",
  torrent: "Torrent",
  onedrive: "OneDrive",
  other: "Other",
};

function applyCheckResult(source: LinkHealthSource, result: Record<string, unknown>) {
  return {
    ...source,
    status: (result["status"] as SourceStatus | undefined) ?? source.status,
    failCount:
      typeof result["failCount"] === "number" ? (result["failCount"] as number) : source.failCount,
    lastCheckedAt:
      typeof result["lastCheckedAt"] === "string"
        ? (result["lastCheckedAt"] as string)
        : typeof result["checkedAt"] === "string"
          ? (result["checkedAt"] as string)
          : source.lastCheckedAt,
  };
}

function formatCheckedAt(value: string | null) {
  if (!value) return "never checked";
  return value.slice(0, 10);
}

export function LinkHealthManager({ sources }: { sources: LinkHealthSource[] }) {
  const [items, setItems] = useState(sources);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [query, setQuery] = useState("");
  const [checkingIds, setCheckingIds] = useState<Set<string>>(new Set());
  const [bulkChecking, setBulkChecking] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LinkHealthSource | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!deleteTarget) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDeleteTarget(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteTarget]);

  const statusCounts = useMemo(() => {
    return items.reduce(
      (acc, source) => {
        acc.all += 1;
        acc[source.status] += 1;
        return acc;
      },
      { all: 0, alive: 0, dead: 0, unknown: 0, checking: 0 } as Record<FilterStatus, number>,
    );
  }, [items]);

  const filteredSources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((source) => {
      if (filter !== "all" && source.status !== filter) return false;
      if (!normalizedQuery) return true;
      return [
        source.pkgTitle,
        source.url,
        source.provider,
        providerLabels[source.provider],
        source.label ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [filter, items, query]);

  const checkOne = async (sourceId: string) => {
    setError(null);
    setCheckingIds((current) => new Set(current).add(sourceId));
    setItems((current) =>
      current.map((source) =>
        source.id === sourceId ? { ...source, status: "checking" as const } : source,
      ),
    );

    try {
      const res = await fetch(`/api/admin/sources/${sourceId}/check`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Health check failed");

      setItems((current) =>
        current.map((source) => (source.id === sourceId ? applyCheckResult(source, data) : source)),
      );
    } catch (e) {
      setError((e as Error).message);
      setItems((current) =>
        current.map((source) =>
          source.id === sourceId ? { ...source, status: "unknown" as const } : source,
        ),
      );
    } finally {
      setCheckingIds((current) => {
        const next = new Set(current);
        next.delete(sourceId);
        return next;
      });
    }
  };

  const checkAll = async () => {
    if (items.length === 0) return;
    setError(null);
    setBulkChecking(true);
    const ids = items.map((source) => source.id);
    setCheckingIds(new Set(ids));
    setItems((current) => current.map((source) => ({ ...source, status: "checking" as const })));

    try {
      const res = await fetch("/api/admin/sources/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Bulk health check failed");

      const results = new Map<string, Record<string, unknown>>();
      for (const result of (data.results ?? []) as Array<Record<string, unknown>>) {
        if (typeof result["sourceId"] === "string") results.set(result["sourceId"], result);
      }

      setItems((current) =>
        current.map((source) => {
          const result = results.get(source.id);
          return result ? applyCheckResult(source, result) : source;
        }),
      );
    } catch (e) {
      setError((e as Error).message);
      setItems((current) => current.map((source) => ({ ...source, status: "unknown" as const })));
    } finally {
      setBulkChecking(false);
      setCheckingIds(new Set());
    }
  };

  const removeSource = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/sources/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not remove source");

      setItems((current) => current.filter((source) => source.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const filters: Array<{ value: FilterStatus; label: string }> = [
    { value: "all", label: "All" },
    { value: "alive", label: "Alive" },
    { value: "dead", label: "Dead" },
    { value: "unknown", label: "Unknown" },
    { value: "checking", label: "Checking" },
  ];

  const modal =
    deleteTarget &&
    createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        <button
          type="button"
          aria-label="Close remove source dialog"
          className="absolute inset-0 cursor-default border-0 bg-[rgba(0,0,0,0.58)] backdrop-blur-md"
          onClick={() => setDeleteTarget(null)}
        />
        {/* biome-ignore lint/a11y/useSemanticElements: Mirrors the existing Download modal pattern and avoids native dialog backdrop issues. */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-source-title"
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
                <div className="mb-1 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-danger">
                  <IconTrash size={13} />
                  Remove source
                </div>
                <h2
                  id="remove-source-title"
                  className="truncate text-base font-bold tracking-[-0.02em] text-text-primary"
                >
                  Delete this download link?
                </h2>
                <p className="mt-1 text-xs text-text-muted">
                  This removes the source from Link Health and the PKG detail.
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close remove source dialog"
                onClick={() => setDeleteTarget(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-text-muted transition duration-200 hover:border-white/20 hover:bg-white/[0.085] hover:text-text-primary"
              >
                <IconX size={17} />
              </button>
            </div>

            <div className="flex flex-col gap-3 px-5 py-4">
              <div className="rounded-[1rem] border border-white/10 bg-white/[0.045] p-3">
                <div className="text-sm font-semibold text-text-primary">
                  {deleteTarget.pkgTitle}
                </div>
                <div className="mt-1 truncate text-xs text-text-muted">{deleteTarget.url}</div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="btn-secondary btn-size-md"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-danger btn-size-md"
                  onClick={removeSource}
                  disabled={deleting}
                >
                  {deleting ? "Removing..." : "Remove link"}
                </button>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>,
      document.body,
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-end",
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "var(--fs-3xl)",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.03em",
              marginBottom: 4,
            }}
          >
            Link Health
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--fs-md)" }}>
            Monitor and manage download sources - {items.length} total links
          </p>
        </div>
        <LiquidButton
          type="button"
          variant="primary"
          size="md"
          onClick={checkAll}
          disabled={bulkChecking || items.length === 0}
          iconLeft={
            bulkChecking ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            ) : (
              <IconRefresh size={15} />
            )
          }
        >
          {bulkChecking ? "Checking links..." : "Check all links"}
        </LiquidButton>
      </div>

      <GlassCard
        variant="content"
        cornerRadius={14}
        padding="12px 16px"
        style={{ marginBottom: 16 }}
      >
        <div
          className="admin-filter-bar"
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {filters.map((item) => {
            const active = filter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "var(--fs-sm)",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: active ? "var(--color-text-primary)" : "var(--color-text-muted)",
                  background: active
                    ? "linear-gradient(180deg, rgba(99, 102, 241, 0.28), rgba(99, 102, 241, 0.10))"
                    : "rgba(255,255,255,0.03)",
                  border: active
                    ? "1px solid rgba(99, 102, 241, 0.4)"
                    : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: active
                    ? "inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(99, 102, 241, 0.22)"
                    : undefined,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {item.label} {statusCounts[item.value]}
              </button>
            );
          })}
          <label
            className="admin-filter-search"
            style={{
              position: "relative",
              minWidth: 220,
              marginLeft: "auto",
              display: "block",
            }}
          >
            <IconSearch
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
              }}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, provider, url..."
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(0,0,0,0.25)",
                color: "var(--color-text-primary)",
                fontSize: "var(--fs-base)",
              }}
            />
          </label>
        </div>
      </GlassCard>

      {error && (
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            padding: "10px 12px",
            borderRadius: "var(--radius-sm)",
            marginBottom: 12,
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            color: "#fca5a5",
            fontSize: "var(--fs-base)",
          }}
        >
          <IconAlertTriangle size={15} />
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filteredSources.map((source) => {
          const st = statusConfig[source.status];
          const isChecking = checkingIds.has(source.id);
          return (
            <GlassCard key={source.id} variant="content" cornerRadius={14} padding="14px 18px">
              <div
                className="admin-source-row"
                style={{ display: "flex", alignItems: "center", gap: 14 }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: st.color,
                    flexShrink: 0,
                    boxShadow: `0 0 8px ${st.color}40`,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <Link
                      href={`/admin/pkgs/${source.pkgId}`}
                      style={{
                        color: "var(--color-text-primary)",
                        fontWeight: 600,
                        fontSize: "var(--fs-md)",
                        textDecoration: "none",
                      }}
                    >
                      {source.pkgTitle}
                    </Link>
                    {source.isPrimary && (
                      <span
                        style={{
                          padding: "1px 6px",
                          borderRadius: "var(--radius-2xs)",
                          fontSize: "var(--fs-2xs)",
                          fontWeight: 600,
                          color: "var(--color-accent-hover)",
                          background: "rgba(99,102,241,0.12)",
                        }}
                      >
                        PRIMARY
                      </span>
                    )}
                    {source.label && (
                      <span style={{ fontSize: "var(--fs-sm)", color: "var(--color-text-faint)" }}>
                        ({source.label})
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--fs-sm)",
                      color: "var(--color-text-faint)",
                      fontFamily: "var(--font-mono)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {source.url}
                  </div>
                </div>

                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--radius-xs)",
                    fontSize: "var(--fs-xs)",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {providerLabels[source.provider] ?? source.provider}
                </span>

                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--radius-pill)",
                    fontSize: "var(--fs-xs)",
                    fontWeight: 600,
                    color: st.color,
                    background: `${st.color}15`,
                    border: `1px solid ${st.color}30`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {st.label}
                </span>

                <div
                  className="admin-source-stats"
                  style={{
                    display: "flex",
                    gap: 16,
                    fontSize: "var(--fs-sm)",
                    color: "var(--color-text-faint)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>{source.downloadCount} dl</span>
                  {source.failCount > 0 && (
                    <span style={{ color: "#f87171" }}>{source.failCount} fails</span>
                  )}
                  <span>{formatCheckedAt(source.lastCheckedAt)}</span>
                </div>

                <div className="admin-source-actions" style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => checkOne(source.id)}
                    disabled={isChecking || bulkChecking}
                    className="btn-secondary"
                    style={{ padding: "6px 10px", fontSize: "var(--fs-xs)", minWidth: 64 }}
                  >
                    {isChecking ? "Checking..." : "Check"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(source)}
                    className="btn-danger"
                    style={{ padding: "6px 10px", fontSize: "var(--fs-xs)" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </GlassCard>
          );
        })}

        {filteredSources.length === 0 && (
          <GlassCard
            variant="content"
            cornerRadius={16}
            padding="60px 20px"
            style={{ textAlign: "center", color: "var(--color-text-faint)" }}
          >
            No sources match this view.
          </GlassCard>
        )}
      </div>

      {modal}
    </div>
  );
}
