"use client";

import { LiquidButton } from "@/components/ui/liquid-button";
import { useState } from "react";

export function QueueActions({ pkgId }: { pkgId: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(action);
    try {
      const res = await fetch("/api/admin/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: pkgId, action }),
      });
      if (res.ok) {
        setDone(action);
        setTimeout(() => window.location.reload(), 600);
      }
    } catch {
      // ignore
    } finally {
      setLoading(null);
    }
  };

  if (done) {
    return (
      <div
        style={{
          padding: "8px 16px",
          borderRadius: "var(--radius-sm)",
          fontSize: "var(--fs-base)",
          fontWeight: 600,
          color: done === "approve" ? "var(--color-success)" : "var(--color-danger)",
          background: done === "approve" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
          border: `1px solid ${done === "approve" ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}`,
        }}
      >
        {done === "approve" ? "✓ Approved" : "✗ Rejected"}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-8)",
        marginLeft: "var(--space-20)",
        flexShrink: 0,
      }}
    >
      <LiquidButton
        variant="primary"
        size="sm"
        onClick={() => handleAction("approve")}
        disabled={loading !== null}
        iconLeft={loading === "approve" ? "◓" : "✓"}
      >
        {loading === "approve" ? "Approving…" : "Approve"}
      </LiquidButton>
      <LiquidButton
        variant="danger"
        size="sm"
        onClick={() => handleAction("reject")}
        disabled={loading !== null}
        iconLeft={loading === "reject" ? "◓" : "✗"}
      >
        {loading === "reject" ? "Rejecting…" : "Reject"}
      </LiquidButton>
    </div>
  );
}
