import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/liquid/glass";

function Bar({ w = "100%", h = 12 }: { w?: number | string; h?: number }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width: w,
        height: h,
        borderRadius: 8,
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 100%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}

export default function UploadLoading() {
  return (
    <>
      <Navbar />
      <main
        className="animate-fade-in"
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "24px 24px 64px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: 22 }}>
          <Bar w={180} h={12} />
          <div style={{ height: 16 }} />
          <Bar w={280} h={32} />
        </div>
        <GlassCard padding="24px" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 999,
                  background: item === 0 ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.06)",
                }}
              />
            ))}
          </div>
          <Bar w={160} h={18} />
          <div style={{ height: 18 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 12 }}>
            <Bar h={42} />
            <Bar h={42} />
          </div>
          <div style={{ height: 12 }} />
          <Bar h={96} />
        </GlassCard>
        <GlassCard padding="18px">
          <Bar w="45%" h={16} />
          <div style={{ height: 12 }} />
          <Bar w="72%" h={12} />
        </GlassCard>
      </main>
    </>
  );
}
