import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/liquid/glass";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to download",
  description: "Get set up with qBittorrent and download from PKGVault in two minutes.",
};

const steps: Array<{ num: number; title: string; body: React.ReactNode }> = [
  {
    num: 1,
    title: "Install qBittorrent",
    body: (
      <>
        Grab <strong style={{ color: "var(--color-text-primary)" }}>qBittorrent</strong> — it&apos;s
        free, open-source, ad-free, and the one we recommend. Available for Windows, macOS and
        Linux. Only download it from the official site:{" "}
        <a
          href="https://www.qbittorrent.org/download"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--color-accent-hover)", fontWeight: 600 }}
        >
          qbittorrent.org ↗
        </a>{" "}
        (avoid third-party installers — they bundle junk).
      </>
    ),
  },
  {
    num: 2,
    title: "Download a game",
    body: (
      <>
        On any package page, hit{" "}
        <strong style={{ color: "var(--color-text-primary)" }}>Download</strong> →{" "}
        <strong style={{ color: "var(--color-text-primary)" }}>Open in qBittorrent</strong>. Your
        browser hands the magnet to qBittorrent (the magnet is also copied to your clipboard, just
        in case). Pick a folder, confirm, and it starts. That&apos;s it.
      </>
    ),
  },
  {
    num: 3,
    title: "Recommended: route it through a VPN",
    body: (
      <>
        Not nerdy — just the sensible default. In qBittorrent:{" "}
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)" }}>
          Tools → Options → Advanced → Network Interface
        </span>{" "}
        and select your VPN adapter. Now torrents <em>only</em> flow through the VPN — if the VPN
        drops, the download stops instead of leaking your real IP. Pair it with any no-logs VPN
        (Mullvad, IVPN, Proton…).
      </>
    ),
  },
  {
    num: 4,
    title: "Seed to preserve",
    body: (
      <>
        When a download finishes, leave it{" "}
        <strong style={{ color: "var(--color-text-primary)" }}>seeding</strong> for a while. The
        whole archive only survives because people keep sharing — a few extra seeders is what keeps
        a delisted game from disappearing for good.
      </>
    ),
  },
];

export default function GuidePage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 64px" }}>
        <h1
          style={{
            fontSize: "var(--fs-5xl)",
            fontWeight: 800,
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-8)",
          }}
        >
          How to download
        </h1>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "var(--fs-lg)",
            marginBottom: "var(--space-24)",
          }}
        >
          Everything here is shared as torrents (magnet links). Two minutes and you&apos;re set.
        </p>

        <GlassCard tint="accent" padding="18px 22px" style={{ marginBottom: "var(--space-24)" }}>
          <p
            style={{
              fontSize: "var(--fs-base)",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            PKGVault doesn&apos;t host any files — it points to torrents. To download, you use a
            torrent client on your own machine. We recommend{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>qBittorrent</strong>: free,
            open-source, no ads, no nonsense.
          </p>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-12)" }}>
          {steps.map((step) => (
            <GlassCard key={step.num} padding="18px 20px">
              <div style={{ display: "flex", gap: "var(--space-14)", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "var(--radius-xs)",
                    flexShrink: 0,
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-accent)",
                    fontSize: "var(--fs-sm)",
                    fontWeight: 700,
                  }}
                >
                  {step.num}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "var(--fs-lg)",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      marginBottom: "var(--space-4)",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "var(--fs-base)",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <Footer />
      </main>
    </>
  );
}
