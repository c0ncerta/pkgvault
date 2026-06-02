import { GlassCard } from "@/components/liquid/glass";
import Link from "next/link";

export default function NotFound() {
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
        className="animate-fade-in"
        padding="56px 44px"
        style={{ textAlign: "center", maxWidth: 440 }}
      >
        <div
          style={{
            fontSize: "5rem",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1,
            marginBottom: 12,
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: 8,
          }}
        >
          Page not found
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: 28 }}>
          The vault doesn&apos;t have what you&apos;re looking for.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/" className="btn-primary">
            Go home
          </Link>
          <Link href="/catalog" className="btn-secondary">
            Browse catalog
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
