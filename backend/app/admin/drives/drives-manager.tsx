"use client";

import { GlassCard } from "@/components/liquid/glass";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DriveAccountRow } from "./page";

const STAT_CARD_STYLE = { minHeight: 80, display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const };

function formatBytes(bytes: string | bigint | number | null): string {
  if (!bytes) return "0 B";
  const num = Number(bytes);
  if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(1)} TB`;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} GB`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} MB`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)} KB`;
  return `${num} B`;
}

function usagePercent(used: string | null, total: string | null): number {
  if (!used || !total) return 0;
  const u = Number(used);
  const t = Number(total);
  if (t === 0) return 0;
  return Math.min(100, (u / t) * 100);
}

function statusColor(status: string): string {
  switch (status) {
    case "active":
      return "#34d399";
    case "token_expired":
      return "#fbbf24";
    case "disconnected":
      return "#6b7280";
    case "quota_exceeded":
      return "#ef4444";
    default:
      return "#6b7280";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Active";
    case "token_expired":
      return "Token Expired";
    case "disconnected":
      return "Disconnected";
    case "quota_exceeded":
      return "Quota Exceeded";
    default:
      return status;
  }
}

function barColor(pct: number): string {
  if (pct >= 90) return "#ef4444";
  if (pct >= 75) return "#f59e0b";
  return "#6366f1";
}

function timeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type Props = {
  accounts: DriveAccountRow[];
  totals: {
    totalQuota: string;
    totalUsed: string;
    activeCount: number;
    totalAccounts: number;
  };
};

export function DrivesManager({ accounts: initialAccounts, totals }: Props) {
  const router = useRouter();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const totalPct = usagePercent(totals.totalUsed, totals.totalQuota);

  async function handleConnect() {
    setConnecting(true);
    try {
      const res = await fetch("/api/admin/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connect" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setConnecting(false);
    }
  }

  async function handleSync(id: string) {
    setSyncing(id);
    try {
      await fetch("/api/admin/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync", id }),
      });
      router.refresh();
    } finally {
      setSyncing(null);
    }
  }

  async function handleDisconnect(id: string) {
    if (!confirm("Disconnect this Drive account? Tokens will be removed.")) return;
    await fetch("/api/admin/drives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disconnect", id }),
    });
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "disconnected" as const } : a)),
    );
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this Drive account record?")) return;
    await fetch("/api/admin/drives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleSyncAll() {
    for (const a of accounts) {
      if (a.status === "active") {
        await handleSync(a.id);
      }
    }
  }

  return (
    <div>
      {/* Aggregate stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 24,
        }}
        className="responsive-stats"
      >
        <GlassCard padding="18px" style={STAT_CARD_STYLE}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "var(--color-text-primary)",
                lineHeight: 1,
              }}
            >
              {totals.totalAccounts}
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginTop: 4,
              }}
            >
              Accounts
            </div>
          </div>
        </GlassCard>
        <GlassCard padding="18px" style={STAT_CARD_STYLE}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "#34d399",
                lineHeight: 1,
              }}
            >
              {totals.activeCount}
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginTop: 4,
              }}
            >
              Active
            </div>
          </div>
        </GlassCard>
        <GlassCard padding="18px" style={STAT_CARD_STYLE}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "var(--color-text-primary)",
                lineHeight: 1,
              }}
            >
              {formatBytes(totals.totalUsed)}
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginTop: 4,
              }}
            >
              Total Used
            </div>
          </div>
        </GlassCard>
        <GlassCard padding="18px" style={STAT_CARD_STYLE}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "var(--color-text-primary)",
                lineHeight: 1,
              }}
            >
              {formatBytes(totals.totalQuota)}
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginTop: 4,
              }}
            >
              Total Quota
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Aggregate usage bar */}
      {Number(totals.totalQuota) > 0 && (
        <GlassCard padding="20px" style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              Combined Storage
            </span>
            <span
              style={{
                fontSize: "0.8rem",
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              {formatBytes(totals.totalUsed)} / {formatBytes(totals.totalQuota)} (
              {totalPct.toFixed(1)}%)
            </span>
          </div>
          <div
            style={{
              height: 10,
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${totalPct}%`,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${barColor(totalPct)}, ${barColor(totalPct)}cc)`,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </GlassCard>
      )}

      {/* Actions bar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="btn-primary"
          onClick={handleConnect}
          disabled={connecting}
          style={{ padding: "10px 20px", fontSize: "0.85rem" }}
        >
          {connecting ? "Redirecting…" : "＋ Connect Google Account"}
        </button>
        {accounts.length > 0 && (
          <button
            type="button"
            className="btn-secondary"
            onClick={handleSyncAll}
            style={{ padding: "10px 20px", fontSize: "0.85rem" }}
          >
            ↻ Sync All
          </button>
        )}
      </div>

      {/* Account cards */}
      {accounts.length === 0 ? (
        <GlassCard padding="60px 40px" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.3 }}>☁️</div>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 8,
            }}
          >
            No Drive accounts connected
          </h2>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.9rem",
              marginBottom: 20,
            }}
          >
            Connect a Google Drive account to monitor storage usage and manage PKG backups.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting ? "Redirecting…" : "Connect Google Account"}
          </button>
        </GlassCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {accounts.map((a) => {
            const pct = usagePercent(a.quotaUsedBytes, a.quotaTotalBytes);
            const isSyncing = syncing === a.id;

            return (
              <GlassCard key={a.id} padding="0" style={{ overflow: "hidden" }}>
                <div style={{ padding: "20px 24px" }}>
                  {/* Header row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 16,
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Google avatar */}
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: "linear-gradient(135deg, #4285f4, #34a853)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 14,
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {a.email.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            color: "var(--color-text-primary)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {a.email}
                          {a.isPrimary && (
                            <span
                              style={{
                                fontSize: "0.6rem",
                                padding: "2px 8px",
                                borderRadius: 999,
                                background: "rgba(99, 102, 241, 0.2)",
                                color: "#818cf8",
                                fontWeight: 700,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                              }}
                            >
                              Primary
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--color-text-muted)",
                            marginTop: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: statusColor(a.status),
                                boxShadow: `0 0 6px ${statusColor(a.status)}60`,
                              }}
                            />
                            {statusLabel(a.status)}
                          </span>
                          {a.label && (
                            <span style={{ color: "var(--color-text-muted)" }}>• {a.label}</span>
                          )}
                          <span>• Synced {timeAgo(a.lastSyncedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => handleSync(a.id)}
                        disabled={isSyncing || a.status === "disconnected"}
                        style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                      >
                        {isSyncing ? "Syncing…" : "↻ Sync"}
                      </button>
                      {a.status !== "disconnected" && (
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => handleDisconnect(a.id)}
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.75rem",
                            color: "var(--color-warning)",
                          }}
                        >
                          Disconnect
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => handleDelete(a.id)}
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.75rem",
                          color: "var(--color-danger)",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Storage bar */}
                  {a.quotaTotalBytes && (
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontFamily: "var(--font-mono)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {formatBytes(a.quotaUsedBytes)} / {formatBytes(a.quotaTotalBytes)}
                        </span>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontFamily: "var(--font-mono)",
                            color: barColor(pct),
                            fontWeight: 600,
                          }}
                        >
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.06)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            borderRadius: 999,
                            background: `linear-gradient(90deg, ${barColor(pct)}, ${barColor(pct)}cc)`,
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Detail stats row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {a.fileCount !== null && <StatPill label="Files" value={String(a.fileCount)} />}
                    {a.folderCount !== null && (
                      <StatPill label="Folders" value={String(a.folderCount)} />
                    )}
                    <StatPill label="PKG Files" value={String(a.pkgFileCount)} />
                    <StatPill label="PKG Size" value={formatBytes(a.pkgTotalBytes)} />
                    {a.quotaUsedInTrashBytes && Number(a.quotaUsedInTrashBytes) > 0 && (
                      <StatPill
                        label="In Trash"
                        value={formatBytes(a.quotaUsedInTrashBytes)}
                        warn
                      />
                    )}
                    {a.quotaTotalBytes && (
                      <StatPill
                        label="Free"
                        value={formatBytes(
                          String(BigInt(a.quotaTotalBytes) - BigInt(a.quotaUsedBytes ?? "0")),
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* Notes */}
                {a.notes && (
                  <div
                    style={{
                      padding: "10px 24px",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      fontSize: "0.8rem",
                      color: "var(--color-text-muted)",
                      fontStyle: "italic",
                    }}
                  >
                    {a.notes}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatPill({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        background: warn ? "rgba(251, 191, 36, 0.08)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${warn ? "rgba(251, 191, 36, 0.15)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      <div
        style={{
          fontSize: "0.95rem",
          fontWeight: 700,
          color: warn ? "#fbbf24" : "var(--color-text-primary)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.65rem",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}
