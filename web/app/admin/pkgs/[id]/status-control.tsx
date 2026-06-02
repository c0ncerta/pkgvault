"use client";

import { useState } from "react";

const statuses = [
  { value: "pending", label: "Pending", color: "var(--color-warning-bright)" },
  { value: "approved", label: "Approved", color: "var(--color-success-bright)" },
  { value: "rejected", label: "Rejected", color: "var(--color-danger-bright)" },
  { value: "taken_down", label: "Taken Down", color: "var(--color-text-muted)" },
];

export function PkgStatusControl({
  pkgId,
  currentStatus,
}: { pkgId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: string) => {
    if (newStatus === status) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pkg/${pkgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="admin-status-control"
      style={{
        display: "inline-flex",
        gap: 2,
        padding: 4,
        borderRadius: "var(--radius-pill)",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 6px rgba(0,0,0,0.18)",
      }}
    >
      {statuses.map((s) => {
        const active = status === s.value;
        return (
          <button
            type="button"
            key={s.value}
            onClick={() => handleChange(s.value)}
            disabled={loading}
            style={{
              padding: "7px 16px",
              borderRadius: "var(--radius-pill)",
              fontSize: "var(--fs-sm)",
              fontWeight: 600,
              border: `1px solid ${active ? `${s.color}50` : "transparent"}`,
              background: active
                ? `linear-gradient(180deg, ${s.color}28, ${s.color}10)`
                : "transparent",
              color: active ? s.color : "var(--color-text-muted)",
              cursor: loading ? "wait" : "pointer",
              fontFamily: "var(--font-sans)",
              boxShadow: active ? `inset 0 1px 0 ${s.color}30, 0 1px 4px ${s.color}25` : undefined,
            }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
