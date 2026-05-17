"use client";

import { useState } from "react";
import { LiquidButton } from "@/components/ui/liquid-button";

interface DownloadButtonProps {
  pkgId: string;
  size: string;
}

export function DownloadButton({ pkgId, size }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/pkg/${pkgId}/download`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Download failed");
        return;
      }

      const { downloadUrl } = await res.json();
      window.open(downloadUrl, "_blank");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <LiquidButton
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleDownload}
        disabled={loading}
        iconLeft={loading ? <span style={{ animation: "pulse-dot 1s ease-in-out infinite" }}>◓</span> : "↓"}
      >
        {loading ? "Generating link…" : `Download · ${size}`}
      </LiquidButton>
      {error && (
        <div style={{ marginTop: 8, fontSize: "0.8rem", color: "var(--color-danger)", textAlign: "center" }}>{error}</div>
      )}
    </div>
  );
}
