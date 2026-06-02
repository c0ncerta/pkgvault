"use client";

import { GlassCard } from "@/components/liquid/glass";
import { IconAlertTriangle } from "@/components/ui/icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-primary)",
        padding: 24,
      }}
    >
      <GlassCard
        variant="elevated"
        padding="48px 40px"
        style={{ textAlign: "center", maxWidth: 440 }}
      >
        <div style={{ fontSize: "var(--fs-6xl)", marginBottom: 16, opacity: 0.4 }}>
          <IconAlertTriangle size={40} />
        </div>
        <h1
          style={{
            fontSize: "var(--fs-3xl)",
            fontWeight: 800,
            color: "var(--color-text-primary)",
            marginBottom: 8,
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "var(--fs-lg)",
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          {error.message || "An unexpected error occurred."}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button type="button" className="btn-primary" onClick={reset}>
            Try again
          </button>
          <a href="/" className="btn-secondary">
            Go home
          </a>
        </div>
      </GlassCard>
    </div>
  );
}
