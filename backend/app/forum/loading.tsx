import { GlassCard } from "@/components/liquid/glass";

export default function ForumLoading() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 64px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
        {/* Sidebar skeleton */}
        <GlassCard padding="20px" style={{ alignSelf: "start" }}>
          <div
            style={{
              width: 100,
              height: 16,
              borderRadius: 4,
              background: "rgba(255,255,255,0.04)",
              marginBottom: 14,
            }}
          />
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "100%",
                height: 36,
                borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
                marginBottom: 4,
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
              borderRadius: 4,
              background: "rgba(255,255,255,0.04)",
              marginBottom: 16,
            }}
          />
          <GlassCard padding="0" style={{ overflow: "hidden" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}
              >
                <div>
                  <div
                    style={{
                      width: 260,
                      height: 14,
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.04)",
                      marginBottom: 6,
                    }}
                  />
                  <div
                    style={{
                      width: 180,
                      height: 10,
                      borderRadius: 3,
                      background: "rgba(255,255,255,0.03)",
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.03)",
                  }}
                />
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
