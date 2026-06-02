"use client";

import { GlassCard, GlassStat } from "@/components/liquid/glass";
import { LiquidButton } from "@/components/ui/liquid-button";
import { useMemo, useState } from "react";

type Candidate = {
  id: string;
  title: string;
  version: string | null;
  sizeBytes: string;
  downloadCount: number;
  sha256: string;
  hasGdrive: boolean;
  torrentDead: boolean;
  gdriveUrl: string | null;
  magnetUrl: string | null;
};

type Props = {
  totalApproved: number;
  withGdrive: number;
  withoutGdrive: number;
  torrentDead: number;
  candidates: Candidate[];
};

type Filter = "all" | "missing" | "torrent-dead" | "with-gdrive";

function formatBytes(bytesStr: string): string {
  const bytes = Number(bytesStr);
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2)} ${units[i]}`;
}

export function BackupsManager({
  totalApproved,
  withGdrive,
  withoutGdrive,
  torrentDead,
  candidates,
}: Props) {
  const [filter, setFilter] = useState<Filter>("missing");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftUrl, setDraftUrl] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [localState, setLocalState] = useState<
    Record<string, { hasGdrive: boolean; gdriveUrl: string | null }>
  >({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates.filter((c) => {
      const overrides = localState[c.id];
      const hasGdrive = overrides?.hasGdrive ?? c.hasGdrive;
      if (filter === "missing" && hasGdrive) return false;
      if (filter === "torrent-dead" && !c.torrentDead) return false;
      if (filter === "with-gdrive" && !hasGdrive) return false;
      if (q && !c.title.toLowerCase().includes(q) && !c.sha256.includes(q)) return false;
      return true;
    });
  }, [candidates, filter, search, localState]);

  async function saveBackup(id: string) {
    setError(null);
    setFeedback(null);
    if (!draftUrl.trim()) {
      setError("URL required");
      return;
    }
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/pkgs/${id}/backup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gdriveUrl: draftUrl.trim(),
          verify: true,
          label: "Manual backup",
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        alive?: boolean;
        directUrl?: string;
      };
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setLocalState((s) => ({
        ...s,
        [id]: { hasGdrive: true, gdriveUrl: draftUrl.trim() },
      }));
      setFeedback(
        data.alive
          ? "Backup registered + verified alive"
          : "Backup registered (unverified — re-check later)",
      );
      setEditingId(null);
      setDraftUrl("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingId(null);
    }
  }

  async function removeBackup(id: string) {
    if (!confirm("Remove GDrive backup for this PKG?")) return;
    setSavingId(id);
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/pkgs/${id}/backup`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLocalState((s) => ({
        ...s,
        [id]: { hasGdrive: false, gdriveUrl: null },
      }));
      setFeedback("Backup removed");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <GlassStat value={totalApproved} label="Approved PKGs" />
        <GlassStat value={withGdrive} label="With GDrive Backup" />
        <GlassStat value={withoutGdrive} label="Missing Backup" />
        <GlassStat value={torrentDead} label="Torrent Dead" />
      </div>

      {/* Feedback */}
      {(error || feedback) && (
        <GlassCard
          variant="content"
          cornerRadius={12}
          padding="10px 16px"
          style={{
            marginBottom: 16,
            color: error ? "#fca5a5" : "#86efac",
            fontSize: "var(--fs-md)",
          }}
        >
          {error ?? feedback}
        </GlassCard>
      )}

      {/* Filter bar */}
      <GlassCard
        variant="content"
        cornerRadius={14}
        padding="12px 16px"
        style={{ marginBottom: 16 }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {(
            [
              ["missing", "Missing backup"],
              ["torrent-dead", "Torrent dead"],
              ["with-gdrive", "Has GDrive"],
              ["all", "All approved"],
            ] as Array<[Filter, string]>
          ).map(([key, label]) => (
            <button
              type="button"
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "7px 14px",
                borderRadius: "var(--radius-pill)",
                fontSize: "var(--fs-sm)",
                fontWeight: 600,
                cursor: "pointer",
                color: filter === key ? "var(--color-text-primary)" : "var(--color-text-muted)",
                background:
                  filter === key
                    ? "linear-gradient(180deg, rgba(99, 102, 241, 0.28), rgba(99, 102, 241, 0.10))"
                    : "rgba(255,255,255,0.03)",
                border:
                  filter === key
                    ? "1px solid rgba(99, 102, 241, 0.4)"
                    : "1px solid rgba(255,255,255,0.06)",
                boxShadow:
                  filter === key
                    ? "inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(99, 102, 241, 0.22)"
                    : undefined,
                fontFamily: "var(--font-sans)",
              }}
            >
              {label}
            </button>
          ))}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or sha256…"
            style={{
              marginLeft: "auto",
              minWidth: 220,
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0,0,0,0.25)",
              color: "var(--color-text-primary)",
              fontSize: "var(--fs-base)",
            }}
          />
        </div>
      </GlassCard>

      {/* List */}
      {filtered.length === 0 ? (
        <GlassCard
          variant="content"
          cornerRadius={14}
          padding="40px"
          style={{ textAlign: "center", color: "var(--color-text-faint)" }}
        >
          No PKGs match this filter.
        </GlassCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((c) => {
            const overrides = localState[c.id];
            const hasGdrive = overrides?.hasGdrive ?? c.hasGdrive;
            const gdriveUrl = overrides?.gdriveUrl ?? c.gdriveUrl;
            const editing = editingId === c.id;
            const saving = savingId === c.id;

            return (
              <GlassCard
                key={c.id}
                variant="content"
                cornerRadius={14}
                padding="14px 18px"
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: hasGdrive ? "#34d399" : "#fbbf24",
                      boxShadow: `0 0 8px ${hasGdrive ? "#34d399" : "#fbbf24"}40`,
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
                      <a
                        href={`/admin/pkgs/${c.id}`}
                        style={{
                          color: "var(--color-text-primary)",
                          fontWeight: 600,
                          fontSize: "var(--fs-lg)",
                          textDecoration: "none",
                        }}
                      >
                        {c.title}
                      </a>
                      {c.version && (
                        <span
                          style={{ color: "var(--color-text-faint)", fontSize: "var(--fs-xs)" }}
                        >
                          v{c.version}
                        </span>
                      )}
                      {c.torrentDead && (
                        <span
                          style={{
                            fontSize: "var(--fs-2xs)",
                            padding: "2px 6px",
                            borderRadius: "var(--radius-2xs)",
                            color: "#fca5a5",
                            background: "rgba(248, 113, 113, 0.12)",
                            fontWeight: 600,
                          }}
                        >
                          TORRENT DEAD
                        </span>
                      )}
                      {hasGdrive && (
                        <span
                          style={{
                            fontSize: "var(--fs-2xs)",
                            padding: "2px 6px",
                            borderRadius: "var(--radius-2xs)",
                            color: "#34d399",
                            background: "rgba(52, 211, 153, 0.12)",
                            fontWeight: 600,
                          }}
                        >
                          GDRIVE
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        color: "var(--color-text-faint)",
                        fontSize: "var(--fs-xs)",
                        fontFamily: "ui-monospace, SF Mono, monospace",
                      }}
                    >
                      {formatBytes(c.sizeBytes)} · {c.downloadCount} dl · {c.sha256.slice(0, 16)}…
                    </div>
                    {hasGdrive && gdriveUrl && !editing && (
                      <a
                        href={gdriveUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={{
                          color: "var(--color-accent-hover)",
                          fontSize: "var(--fs-xs)",
                          textDecoration: "none",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "100%",
                        }}
                      >
                        {gdriveUrl}
                      </a>
                    )}
                    {editing && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginTop: 8,
                        }}
                      >
                        <input
                          value={draftUrl}
                          onChange={(e) => setDraftUrl(e.target.value)}
                          placeholder="https://drive.google.com/file/d/…/view"
                          style={{
                            flex: 1,
                            padding: "6px 10px",
                            borderRadius: "var(--radius-xs)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(0,0,0,0.3)",
                            color: "var(--color-text-primary)",
                            fontSize: "var(--fs-sm)",
                          }}
                        />
                        <LiquidButton
                          variant="primary"
                          size="sm"
                          disabled={saving}
                          onClick={() => saveBackup(c.id)}
                        >
                          {saving ? "Saving…" : "Save"}
                        </LiquidButton>
                        <LiquidButton
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(null);
                            setDraftUrl("");
                          }}
                        >
                          Cancel
                        </LiquidButton>
                      </div>
                    )}
                  </div>

                  {!editing && (
                    <div style={{ display: "flex", gap: 6 }}>
                      {c.magnetUrl && (
                        <LiquidButton
                          variant="secondary"
                          size="sm"
                          title="Copy backup script invocation"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `./scripts/backup-to-gdrive.sh ${c.id} "${c.magnetUrl}" ${c.sha256}`,
                            );
                            setFeedback("Backup command copied to clipboard");
                          }}
                          iconLeft="⧉"
                        >
                          Copy cmd
                        </LiquidButton>
                      )}
                      <LiquidButton
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setEditingId(c.id);
                          setDraftUrl(gdriveUrl ?? "");
                        }}
                      >
                        {hasGdrive ? "Edit" : "Add backup"}
                      </LiquidButton>
                      {hasGdrive && (
                        <LiquidButton
                          variant="danger"
                          size="sm"
                          disabled={saving}
                          onClick={() => removeBackup(c.id)}
                        >
                          Remove
                        </LiquidButton>
                      )}
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </>
  );
}
