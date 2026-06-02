import { GlassCard } from "@/components/liquid/glass";

export default function ForumLoading() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 64px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "var(--space-24)" }}>
        {/* Sidebar skeleton */}
        <GlassCard padding="20px" style={{ alignSelf: "start" }}>
          <div
            style={{
              width: 100,
              height: 16,
              borderRadius: "var(--radius-2xs)",
              background: "rgba(255,255,255,0.04)",
              marginBottom: "var(--space-14)",
            }}
          />
          {Array.from({ length: 6 }, (_, i) => ({ id: `skel-side-${i}` })).map((s) => (
            <div
              key={s.id}
              style={{
                width: "100%",
                height: 36,
                borderRadius: "var(--radius-xs)",
                background: "rgba(255,255,255,0.03)",
                marginBottom: "var(--space-4)",
              }}
            />
          ))}
        </GlassCard>

        {/* Thread list skeleton */}
        <div>
          <div
            style={{
              width: 160,
              height: 24,
              borderRadius: "var(--radius-2xs)",
              background: "rgba(255,255,255,0.04)",
              marginBottom: "var(--space-16)",
            }}
          />
          <GlassCard padding="0" style={{ overflow: "hidden" }}>
            {Array.from({ length: 6 }, (_, i) => ({ id: `skel-thread-${i}`, isLast: i >= 5 })).map(
              (s) => (
                <div
                  key={s.id}
                  style={{
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: s.isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: 260,
                        height: 14,
                        borderRadius: "var(--radius-2xs)",
                        background: "rgba(255,255,255,0.04)",
                        marginBottom: "var(--space-6)",
                      }}
                    />
                    <div
                      style={{
                        width: 180,
                        height: 10,
                        borderRadius: "var(--radius-2xs)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "var(--radius-2xs)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  />
                </div>
              ),
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
