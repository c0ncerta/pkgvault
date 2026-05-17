"use client";

import { GlassCard } from "@/components/liquid/glass";
import { IconFire } from "@/components/ui/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";

interface CatalogFiltersProps {
  currentQ: string;
  currentSort: string;
  currentPlatform: string;
  platformCounts: Array<{ value: string; count: number }>;
  regionCounts: Array<{ value: string; count: number }>;
  total: number;
}

const SORT_OPTIONS: Array<{ value: string; label: string; icon: ReactNode }> = [
  { value: "newest", label: "Newest first", icon: "\u2193" },
  { value: "oldest", label: "Oldest first", icon: "\u2191" },
  { value: "downloads", label: "Most downloads", icon: <IconFire size={14} /> },
  { value: "title", label: "Title (A-Z)", icon: "A" },
];

export function CatalogFilters({
  currentQ,
  currentSort,
  currentPlatform,
  platformCounts,
  regionCounts,
  total,
}: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(currentQ);
  const [, startTransition] = useTransition();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`/catalog?${params.toString()}`));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", q);
  };

  const clearAll = () => {
    setQ("");
    startTransition(() => router.push("/catalog"));
  };

  const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
  if (currentQ)
    activeFilters.push({
      label: `"${currentQ}"`,
      onRemove: () => {
        setQ("");
        updateParam("q", "");
      },
    });
  if (currentPlatform)
    activeFilters.push({
      label: currentPlatform,
      onRemove: () => updateParam("platform", ""),
    });
  if (currentSort !== "newest") {
    const opt = SORT_OPTIONS.find((s) => s.value === currentSort);
    if (opt)
      activeFilters.push({
        label: opt.label,
        onRemove: () => updateParam("sort", ""),
      });
  }

  const sectionHeadingStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.7rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontWeight: 600,
    color: "var(--color-text-muted)",
    marginBottom: 10,
  };

  return (
    <aside
      style={{
        position: "sticky",
        top: 84,
        alignSelf: "start",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <GlassCard padding="18px">
        <form onSubmit={handleSearch} style={{ marginBottom: 0 }}>
          <label
            htmlFor="catalog-search"
            style={{
              display: "block",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
              color: "var(--color-text-muted)",
              marginBottom: 8,
            }}
          >
            Search
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="catalog-search"
              className="input"
              placeholder="title, sha, version\u2026"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: "100%", paddingRight: 36 }}
            />
            <button
              type="submit"
              style={{
                position: "absolute",
                right: 6,
                top: "50%",
                transform: "translateY(-50%)",
                background: "var(--color-accent)",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                width: 28,
                height: 28,
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
              aria-label="Search"
            >
              &#x2316;
            </button>
          </div>
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--color-text-muted)",
              marginTop: 6,
              fontFamily: "var(--font-mono)",
            }}
          >
            {total.toLocaleString()} result{total === 1 ? "" : "s"}
          </div>
        </form>
      </GlassCard>

      {activeFilters.length > 0 && (
        <GlassCard padding="14px 16px">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 600,
                color: "var(--color-text-muted)",
              }}
            >
              Active
            </span>
            <button
              type="button"
              onClick={clearAll}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-danger)",
                fontSize: "0.7rem",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              Clear all
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {activeFilters.map((f) => (
              <button
                type="button"
                key={f.label}
                onClick={f.onRemove}
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                  color: "var(--color-text-primary)",
                  padding: "3px 8px 3px 10px",
                  borderRadius: 999,
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {f.label} <span style={{ opacity: 0.6, fontSize: "0.85rem" }}>\u00d7</span>
              </button>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard padding="18px">
        <h3 style={sectionHeadingStyle}>Sort</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {SORT_OPTIONS.map((s) => {
            const active = currentSort === s.value || (s.value === "newest" && !currentSort);
            return (
              <button
                type="button"
                key={s.value}
                onClick={() => updateParam("sort", s.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 10px",
                  borderRadius: 10,
                  border: "none",
                  background: active ? "rgba(99, 102, 241, 0.1)" : "transparent",
                  color: active ? "var(--color-accent-hover)" : "var(--color-text-primary)",
                  fontSize: "0.8rem",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <span
                  style={{
                    width: 14,
                    textAlign: "center",
                    fontSize: "0.75rem",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {s.icon}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard padding="18px">
        <h3 style={sectionHeadingStyle}>Platform</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <button
            type="button"
            onClick={() => updateParam("platform", "")}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "7px 10px",
              borderRadius: 10,
              border: "none",
              background: !currentPlatform ? "rgba(99, 102, 241, 0.1)" : "transparent",
              color: !currentPlatform ? "var(--color-accent-hover)" : "var(--color-text-primary)",
              fontSize: "0.8rem",
              textAlign: "left",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontWeight: !currentPlatform ? 600 : 400,
            }}
          >
            <span>All platforms</span>
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {total}
            </span>
          </button>
          {platformCounts.map((p) => {
            const active = currentPlatform === p.value;
            return (
              <button
                type="button"
                key={p.value}
                onClick={() => updateParam("platform", p.value)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "7px 10px",
                  borderRadius: 10,
                  border: "none",
                  background: active ? "rgba(99, 102, 241, 0.1)" : "transparent",
                  color: active ? "var(--color-accent-hover)" : "var(--color-text-primary)",
                  fontSize: "0.8rem",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <span>{p.value}</span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {p.count}
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {regionCounts.length > 0 && (
        <GlassCard padding="18px">
          <h3 style={sectionHeadingStyle}>Region</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {regionCounts.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => updateParam("q", r.value)}
                style={{
                  padding: "4px 9px",
                  borderRadius: 999,
                  background: "rgba(139, 92, 246, 0.06)",
                  border: "1px solid rgba(139, 92, 246, 0.15)",
                  color: "var(--color-text-secondary)",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {r.value}{" "}
                <span
                  style={{
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {r.count}
                </span>
              </button>
            ))}
          </div>
        </GlassCard>
      )}
    </aside>
  );
}
