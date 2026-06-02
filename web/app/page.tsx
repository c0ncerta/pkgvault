import { HomeActivityFeed } from "@/components/home/activity-feed";
import { HomeFeaturedPkgs } from "@/components/home/featured-pkgs";
import { HomeFeatures } from "@/components/home/features";
import { HomeForumStrip } from "@/components/home/forum-strip";
import { HomeHero } from "@/components/home/hero";
import { HomeLeaderboard } from "@/components/home/leaderboard";
import { HomeStats } from "@/components/home/stats";
import { HomeTrendingTags } from "@/components/home/trending-tags";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { InViewFade } from "@/components/motion/transitions";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 64px)", position: "relative", zIndex: 1 }}>
        <HomeHero />
        <InViewFade>
          <HomeStats />
        </InViewFade>
        <InViewFade>
          <HomeFeaturedPkgs />
        </InViewFade>

        <InViewFade>
          <section style={{ maxWidth: 1100, margin: "96px auto 0", padding: "0 24px" }}>
            <div style={{ marginBottom: "var(--space-20)" }}>
              <div
                style={{
                  fontSize: "var(--fs-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--color-cyan)",
                  fontWeight: 600,
                  marginBottom: "var(--space-4)",
                }}
              >
                Community
              </div>
              <h2
                style={{
                  fontSize: "var(--fs-3xl)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "var(--color-text-primary)",
                }}
              >
                What&apos;s happening
              </h2>
            </div>
            <div
              className="responsive-community-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
                gap: "var(--space-16)",
              }}
            >
              <HomeActivityFeed />
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-16)" }}>
                <HomeLeaderboard />
                <HomeTrendingTags />
              </div>
            </div>
          </section>
        </InViewFade>

        <InViewFade>
          <HomeForumStrip />
        </InViewFade>
        <InViewFade>
          <HomeFeatures />
        </InViewFade>
        <Footer />
      </main>
    </>
  );
}
