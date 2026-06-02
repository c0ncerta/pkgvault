"use client";

import { GlassCard } from "@/components/liquid/glass";
import { IconCatalog, IconSearch } from "@/components/ui/icons";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; title: string; platform?: string }>>(
    [],
  );
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/pkg?q=${encodeURIComponent(q)}&limit=5`);
      if (res.ok) {
        const json = await res.json();
        setResults(json.data ?? []);
        setOpen(true);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleSelect = (id: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/catalog/${id}`);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        className="search-glass"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 16px",
          height: 38,
          borderRadius: "var(--radius-pill)",
          border: "1px solid rgba(255,255,255,0.10)",
          width: 260,
          transition:
            "border-color var(--dur-base), width var(--dur-base), background var(--dur-base), box-shadow var(--dur-base)",
        }}
      >
        <IconSearch size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          placeholder="Search title, hash, tag…"
          style={{
            border: "none",
            background: "none",
            outline: "none",
            color: "var(--color-text-primary)",
            fontSize: "var(--fs-base)",
            fontFamily: "var(--font-mono)",
            width: "100%",
          }}
        />
        {loading && (
          <span style={{ fontSize: "var(--fs-xs)", color: "var(--color-text-muted)" }}>…</span>
        )}
      </div>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <GlassCard
          cornerRadius={16}
          padding="4px"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "calc(100% + 6px)",
            overflow: "hidden",
            zIndex: 100,
            animation: "glass-pop var(--dur-fast) var(--ease-out-spring)",
          }}
        >
          {results.map((r) => (
            <button
              type="button"
              key={r.id}
              onClick={() => handleSelect(r.id)}
              className="filter-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--radius-base)",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "var(--fs-md)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <IconCatalog size={14} style={{ color: "var(--color-text-muted)" }} />
              <span style={{ flex: 1 }}>{r.title}</span>
              {r.platform && (
                <span className="tag" style={{ fontSize: "var(--fs-2xs)" }}>
                  {r.platform}
                </span>
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              router.push(`/catalog?q=${encodeURIComponent(query)}`);
              setOpen(false);
            }}
            style={{
              display: "block",
              width: "100%",
              padding: "8px 12px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--color-accent-hover)",
              fontSize: "var(--fs-base)",
              fontFamily: "var(--font-sans)",
              textAlign: "center",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            See all results for &ldquo;{query}&rdquo;
          </button>
        </GlassCard>
      )}
    </div>
  );
}
