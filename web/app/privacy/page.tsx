import { GlassCard } from "@/components/liquid/glass";

export default function PrivacyPage() {
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
        Privacy Policy
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: "var(--fs-lg)",
          marginBottom: "var(--space-32)",
          fontFamily: "var(--font-mono)",
        }}
      >
        Last updated · May 2026
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-16)" }}>
        {[
          {
            title: "Data we collect",
            body: "We collect your email address and display name when you register. Upload metadata (file hashes, sizes, timestamps) is stored for integrity verification. We do not collect analytics or tracking data.",
          },
          {
            title: "How we use it",
            body: "Your data is used solely to operate PKGVault: authentication, content moderation, and community features. We never sell or share your information with third parties.",
          },
          {
            title: "Cookies",
            body: "We use a single session cookie for authentication. No third-party cookies, no advertising trackers.",
          },
          {
            title: "Data retention",
            body: "Account data is retained while your account is active. You can request deletion at any time through Settings → Danger Zone. Forum posts may be anonymized rather than deleted to preserve thread integrity.",
          },
          {
            title: "Security",
            body: "Passwords are hashed with bcrypt. All connections use HTTPS. Database access is restricted to authorized services only.",
          },
          {
            title: "Contact",
            body: "For privacy concerns, reach out to the admin team through the forum or the contact information listed on the site.",
          },
        ].map((section) => (
          <GlassCard key={section.title} padding="20px 22px">
            <h3
              style={{
                fontSize: "var(--fs-lg)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "var(--space-8)",
              }}
            >
              {section.title}
            </h3>
            <p
              style={{
                fontSize: "var(--fs-base)",
                color: "var(--color-text-secondary)",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {section.body}
            </p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
