import { GlassCard } from "@/components/liquid/glass";

export default function GlobalLoading() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--color-bg-primary)",
    }}>
      <div style={{ textAlign: "center" }}>
        <GlassCard variant="elevated" padding="0" cornerRadius={12} style={{
          width: 48, height: 48, margin: "0 auto 16px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 18, color: "#fff",
          animation: "pulse 1.5s ease-in-out infinite",
        }}>PV</GlassCard>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Loading…</p>
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.95); } }`}</style>
    </div>
  );
}
