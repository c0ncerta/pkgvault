import { GlassCard } from "@/components/liquid/glass";

export default function RulesPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 64px" }}>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "var(--color-text-primary)",
          marginBottom: 8,
        }}
      >
        Community Rules
      </h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: 32 }}>
        By using PKGVault you agree to follow these rules.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          {
            title: "Respect others",
            desc: "No harassment, hate speech, or personal attacks. Treat everyone with respect.",
          },
          {
            title: "No malware or tampered files",
            desc: "All uploads must be clean. Tampered or malicious files result in an immediate ban.",
          },
          {
            title: "Verify your uploads",
            desc: "Include SHA-256 hashes and accurate metadata. Mislabeled files will be removed.",
          },
          {
            title: "No commercial redistribution",
            desc: "PKGVault is a community archive. Do not sell or commercially redistribute files.",
          },
          {
            title: "Report, don't retaliate",
            desc: "If you see a rule violation, use the report button. Don't engage.",
          },
          {
            title: "One account per person",
            desc: "Alt accounts used to evade bans or manipulate votes will be removed.",
          },
        ].map((rule, i) => (
          <GlassCard key={i} padding="18px 20px">
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-accent)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: 4,
                  }}
                >
                  {rule.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.8rem",
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
    </div>
  );
}
