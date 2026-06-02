import { GlassCard } from "@/components/liquid/glass";

export default function RulesPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 64px" }}>
      <h1
        style={{
          fontSize: "var(--fs-5xl)",
          fontWeight: 800,
          color: "var(--color-text-primary)",
          marginBottom: "var(--space-8)",
        }}
      >
        Community Rules
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: "var(--fs-lg)",
          marginBottom: "var(--space-24)",
        }}
      >
        By using PKGVault you agree to follow these rules.
      </p>

      {/* Mission — what this place is, and what it is not */}
      <GlassCard tint="accent" padding="20px 22px" style={{ marginBottom: "var(--space-24)" }}>
        <h2
          style={{
            fontSize: "var(--fs-xl)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-8)",
          }}
        >
          What PKGVault is
        </h2>
        <p
          style={{
            fontSize: "var(--fs-base)",
            color: "var(--color-text-secondary)",
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          PKGVault is a{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>
            non-commercial game preservation
          </strong>{" "}
          project. It exists because digital ownership is fragile: storefronts close, titles get
          delisted, and games people already paid for can vanish from their accounts overnight. When
          a publisher stops supporting a product&apos;s lifecycle, keeping a copy is often the only
          way to keep that game playable.
        </p>
        <p
          style={{
            fontSize: "var(--fs-base)",
            color: "var(--color-text-secondary)",
            lineHeight: 1.65,
            margin: "var(--space-12) 0 0",
          }}
        >
          We do not endorse piracy, and we do not profit from anything here — no sales, no ads, no
          paid tiers, ever. This is an archive run for preservation, not a storefront. If
          you&apos;re looking to obtain current commercial releases for free, this isn&apos;t the
          place.
        </p>
      </GlassCard>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-12)" }}>
        {[
          {
            num: 1,
            title: "Preservation, not piracy",
            desc: "Share content for preservation: homebrew, open-source and fan-made projects, and games that are delisted, abandoned, or no longer purchasable through official channels. Don't use PKGVault to distribute current, readily-available commercial releases.",
          },
          {
            num: 2,
            title: "Strictly non-commercial",
            desc: "No selling, paywalls, ads-for-profit, or donations tied to access — by anyone, including you. Money is never part of PKGVault. Commercial redistribution of files is prohibited.",
          },
          {
            num: 3,
            title: "Respect copyright holders",
            desc: "Only upload what you have the right to share. If you are a rights holder and want something removed, we honor takedown requests promptly — see the copyright section below.",
          },
          {
            num: 4,
            title: "No firmware or decryption keys",
            desc: "Don't post console firmware, activation keys, or decryption keys. Requests for current commercial titles are also not allowed.",
          },
          {
            num: 5,
            title: "No malware or tampered files",
            desc: "All uploads must be clean. Tampered or malicious files result in an immediate ban.",
          },
          {
            num: 6,
            title: "Verify your uploads",
            desc: "Include SHA-256 hashes and accurate metadata. Mislabeled files will be removed.",
          },
          {
            num: 7,
            title: "Respect others",
            desc: "No harassment, hate speech, or personal attacks. Treat everyone with respect.",
          },
          {
            num: 8,
            title: "Report, don't retaliate",
            desc: "If you see a rule violation, use the report button. Don't engage.",
          },
          {
            num: 9,
            title: "One account per person",
            desc: "Alt accounts used to evade bans or manipulate votes will be removed.",
          },
        ].map((rule) => (
          <GlassCard key={rule.title} padding="18px 20px">
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
                {rule.num}
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
                  {rule.title}
                </h3>
                <p
                  style={{
                    fontSize: "var(--fs-base)",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {rule.desc}
                </p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Copyright & takedowns */}
      <GlassCard padding="20px 22px" style={{ marginTop: "var(--space-24)" }}>
        <h2
          style={{
            fontSize: "var(--fs-xl)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-8)",
          }}
        >
          Copyright &amp; takedowns
        </h2>
        <p
          style={{
            fontSize: "var(--fs-base)",
            color: "var(--color-text-secondary)",
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          We respect intellectual property rights. If you are a copyright holder (or an authorized
          agent) and believe content here infringes your rights, you can have it removed — no legal
          threats required. Use the{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>report button</strong> on the item,
          or reach the admin team through the forum. Valid requests are actioned promptly and the
          content is taken down.
        </p>
      </GlassCard>

      {/* Disclaimer */}
      <p
        style={{
          fontSize: "var(--fs-sm)",
          color: "var(--color-text-faint)",
          lineHeight: 1.6,
          marginTop: "var(--space-16)",
        }}
      >
        PKGVault is provided “as is”, for archival and preservation purposes only, with no warranty
        of any kind. You are responsible for complying with the laws of your own jurisdiction. By
        uploading, you confirm you have the right to share the file. The operators run this project
        at no profit and remove infringing or unlawful content on notice.
      </p>
    </div>
  );
}
