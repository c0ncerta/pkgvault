"use client";

import { GlassCard } from "@/components/liquid/glass";
import { IconFile } from "@/components/ui/icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const categories = [
  { value: "general", label: "General" },
  { value: "scene_news", label: "Scene News" },
  { value: "jailbreak", label: "Jailbreak" },
  { value: "troubleshoot", label: "Troubleshoot" },
  { value: "releases", label: "Releases" },
  { value: "off_topic", label: "Off-topic" },
];

export function NewThreadForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("pkgv-thread-draft");
    if (saved) {
      try {
        const draft = JSON.parse(saved) as Partial<{
          title: string;
          category: string;
          body: string;
        }>;
        if (typeof draft.title === "string") setTitle(draft.title);
        if (typeof draft.category === "string") setCategory(draft.category);
        if (typeof draft.body === "string") setBody(draft.body);
      } catch {
        /* ignore */
      }
    }
    setDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;

    const timer = setTimeout(() => {
      localStorage.setItem("pkgv-thread-draft", JSON.stringify({ title, category, body }));
    }, 400);

    return () => clearTimeout(timer);
  }, [body, category, draftLoaded, title]);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required");
      return;
    }
    if (title.length < 10) {
      setError("Title must be at least 10 characters");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, bodyMd: body }),
      });

      if (res.status === 429) {
        setError("Rate limited — wait a minute before posting.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to create thread");
        return;
      }

      const { threadId } = await res.json();
      localStorage.removeItem("pkgv-thread-draft");
      router.push(`/forum/${threadId}`);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}
    >
      {/* Main editor */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h1
          style={{ fontSize: "var(--fs-4xl)", fontWeight: 800, color: "var(--color-text-primary)" }}
        >
          New Thread
        </h1>

        <div>
          <label
            htmlFor="thread-title"
            style={{
              display: "block",
              fontSize: "var(--fs-xs)",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 6,
            }}
          >
            Title *
          </label>
          <input
            id="thread-title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Guide: full PKG dump with webMAN MOD 1.47"
            style={{ fontSize: "var(--fs-xl)" }}
          />
          <div
            style={{
              fontSize: "var(--fs-xs)",
              color: "var(--color-text-faint)",
              fontFamily: "var(--font-mono)",
              marginTop: 4,
            }}
          >
            min 10 · max 120 · {title.length}/120
          </div>
        </div>

        {/* Category pills */}
        <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
          <div
            style={{
              display: "block",
              fontSize: "var(--fs-xs)",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 6,
            }}
          >
            Category *
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className="tag"
                style={{
                  cursor: "pointer",
                  border: "none",
                  padding: "5px 12px",
                  background:
                    category === cat.value ? "var(--color-accent)" : "rgba(255,255,255,0.04)",
                  color: category === cat.value ? "#fff" : "var(--color-text-secondary)",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "var(--fs-base)",
                  fontWeight: 500,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Body */}
        <textarea
          className="input"
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your post here…"
          style={{ resize: "vertical", lineHeight: 1.6, fontSize: "var(--fs-lg)" }}
        />

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-xs)",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#fca5a5",
              fontSize: "var(--fs-md)",
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 14,
          }}
        >
          <span
            style={{
              fontSize: "var(--fs-sm)",
              color: "var(--color-text-faint)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <IconFile size={12} /> draft auto-saved
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn-ghost" onClick={() => router.push("/forum")}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Publishing…" : "Publish Thread"}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <GlassCard padding="16px">
          <h4
            style={{
              fontSize: "var(--fs-md)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 10,
            }}
          >
            Quick rules
          </h4>
          <ul
            style={{
              margin: 0,
              paddingLeft: 16,
              fontSize: "var(--fs-base)",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
            }}
          >
            <li>No direct firmware links</li>
            <li>No commercial ROM requests</li>
            <li>Cite sources for cross-posts</li>
            <li>
              Use <code style={{ fontSize: "var(--fs-sm)" }}>guide</code> tag for guides
            </li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
