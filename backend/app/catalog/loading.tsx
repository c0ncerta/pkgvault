import { GlassCard } from "@/components/liquid/glass";
import { Navbar } from "@/components/layout/navbar";

function Bar({ w = "100%", h = 12 }: { w?: number | string; h?: number }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width: w, height: h, borderRadius: 8,
        background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 100%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}

export default function CatalogLoading() {
  return (
    <>
      <Navbar />
      <main className="animate-fade-in" style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 64px", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 28 }}>
          <Bar w={100} h={10} />
          <div style={{ height: 10 }} />
          <Bar w={260} h={30} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 28 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <GlassCard key={i} padding="14px 18px"><Bar w="70%" h={22} /></GlassCard>
          ))}
        </div>
        <div className="responsive-catalog-layout" style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)", gap: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[0, 1, 2, 3].map((i) => (
              <GlassCard key={i} padding="18px"><Bar w="100%" h={36} /></GlassCard>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {Array.from({ length: 9 }, (_, i) => i).map((i) => (
              <GlassCard key={i} padding="0" style={{ overflow: "hidden" }}>
                <div style={{ height: 116, background: "rgba(255,255,255,0.04)" }} />
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  <Bar w="80%" h={14} />
                  <Bar w="50%" h={10} />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
