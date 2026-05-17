"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/liquid/glass";
import { IconFile } from "@/components/ui/icons";

interface ReplyFormProps {
  threadId: string;
  parentId?: string;
  onCancel?: () => void;
}

export function ReplyForm({ threadId, parentId, onCancel }: ReplyFormProps) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/forum/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyMd: body, parentId: parentId ?? null }),
      });

      if (res.status === 429) {
        setError("Slow down — you're posting too fast. Try again in a minute.");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to post reply");
        return;
      }

      setBody("");
      router.refresh(); // Re-fetch server data to show new post
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tools = ["B", "I", "</>", <IconFile key="attach" size={14} />, "@"];

  return (
    <GlassCard padding="18px">
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 10 }}>
        {parentId ? "Reply" : "Your reply"}
      </h3>

      <textarea
        className="input"
        rows={4}
        placeholder="Write here · basic markdown + attachments (max 5MB · images/logs)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        style={{ resize: "vertical", marginBottom: 8 }}
      />

      {error && (
        <div style={{
          padding: "8px 12px", borderRadius: 6, marginBottom: 8,
          background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
          color: "#fca5a5", fontSize: "0.8rem",
        }}>{error}</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {tools.map((tool) => (
            <button key={tool} type="button" className="btn-ghost" style={{ padding: "6px 10px", fontSize: "0.8rem", minWidth: 32 }}>
              {tool}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {onCancel && <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !body.trim()}
            style={{ opacity: loading || !body.trim() ? 0.5 : 1 }}
          >
            {loading ? "Posting…" : "Post reply"}
          </button>
        </div>
      </div>
    </form>
    </GlassCard>
  );
}
