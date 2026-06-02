"use client";

import { IconSearch } from "@/components/ui/icons";
import { LiquidButton } from "@/components/ui/liquid-button";
import { useState } from "react";

export function SourceActions({ sourceId }: { sourceId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/sources/${sourceId}/check`, { method: "POST" });
      window.location.reload();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this source link?")) return;
    try {
      await fetch(`/api/admin/sources/${sourceId}`, { method: "DELETE" });
      window.location.reload();
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ display: "flex", gap: "var(--space-6)" }}>
      <LiquidButton
        variant="secondary"
        size="sm"
        onClick={handleCheck}
        disabled={loading}
        iconLeft={loading ? "◓" : <IconSearch size={14} />}
      >
        {loading ? "Checking…" : "Check"}
      </LiquidButton>
      <LiquidButton variant="danger" size="sm" onClick={handleDelete} iconLeft="✗">
        Remove
      </LiquidButton>
    </div>
  );
}
