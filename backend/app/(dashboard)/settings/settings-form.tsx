"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { GlassCard } from "@/components/liquid/glass";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface UserData { name: string; email: string; image: string | null; role: string }

type Section = "account" | "security" | "notifications" | "privacy" | "danger";

const sections: Array<{ key: Section; label: string; danger?: boolean }> = [
  { key: "account", label: "Account" },
  { key: "security", label: "Session & security" },
  { key: "notifications", label: "Notifications" },
  { key: "privacy", label: "Privacy" },
  { key: "danger", label: "Danger zone", danger: true },
];

export function SettingsForm({ initialUser }: { initialUser: UserData }) {
  const [section, setSection] = useState<Section>("account");
  const [name, setName] = useState(initialUser.name);
  const [email, setEmail] = useState(initialUser.email);
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const router = useRouter();

  const hasChanges = useMemo(
    () => name !== initialUser.name || email !== initialUser.email || bio.length > 0,
    [name, email, bio, initialUser],
  );

  const handleSave = async () => {
    setSaving(true); setFeedback(null);
    try {
      const res = await fetch("/api/auth/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: initialUser.image }),
      });
      if (res.ok) {
        setFeedback("✓ Changes saved");
        router.refresh();
      } else {
        setFeedback("Failed to save");
      }
    } catch { setFeedback("Network error"); }
    finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    await signOut();
    router.push("/");
  };

  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="animate-fade-in responsive-settings-layout" style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 24 }}>
      {/* Sidebar */}
      <GlassCard className="responsive-settings-sidebar" padding="8px" style={{ alignSelf: "start" }}>
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "11px 14px", borderRadius: 8, cursor: "pointer",
              background: section === s.key ? "rgba(99, 102, 241, 0.06)" : "transparent",
              borderLeft: section === s.key ? "3px solid var(--color-accent)" : "3px solid transparent",
              border: "none", fontSize: "0.85rem", fontWeight: section === s.key ? 600 : 400,
              color: s.danger ? "var(--color-danger)" : "var(--color-text-primary)",
              fontFamily: "var(--font-sans)", transition: "background 0.15s",
            }}
          >{s.label}</button>
        ))}
      </GlassCard>

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {section === "account" && (
          <>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)" }}>Account</h1>

            {/* Avatar */}
            <GlassCard padding="18px" style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{
                width: 88, height: 88, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: "2rem", color: "#fff",
              }}>{initials}</div>
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>Avatar</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: 12 }}>JPG/PNG · max 1MB</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-secondary">Upload image</button>
                  <button className="btn-ghost">Remove</button>
                </div>
              </div>
            </GlassCard>

            {/* Fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 500, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Display name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 500, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Email</label>
                <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} style={{ fontFamily: "var(--font-mono)" }} />
                <div style={{ fontSize: "0.7rem", color: "var(--color-success)", fontFamily: "var(--font-mono)", marginTop: 4 }}>✓ verified</div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 500, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Bio</label>
              <textarea className="input" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself…" style={{ resize: "vertical" }} />
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", marginTop: 4 }}>{bio.length}/200</div>
            </div>

            {/* Role badge */}
            <GlassCard padding="14px" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--color-text-primary)" }}>Role</span>
              <span className="tag tag-accent">{initialUser.role}</span>
            </GlassCard>

            {/* Theme */}
            <GlassCard padding="16px" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-primary)", fontWeight: 500 }}>Appearance</span>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "2px 0 0" }}>Choose your preferred theme</p>
              </div>
              <ThemeToggle />
            </GlassCard>
          </>
        )}

        {section === "security" && (
          <>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)" }}>Session & Security</h1>
            <GlassCard padding="18px">
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 12 }}>Change password</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input className="input" type="password" placeholder="Current password" />
                <input className="input" type="password" placeholder="New password (min 8 characters)" />
                <input className="input" type="password" placeholder="Confirm new password" />
                <button className="btn-secondary" style={{ alignSelf: "flex-start" }}>Update password</button>
              </div>
            </GlassCard>
            <GlassCard padding="18px">
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 8 }}>Active sessions</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Current session is active. Use the button below to sign out from all devices.</p>
              <button className="btn-secondary" style={{ marginTop: 12 }}>Sign out everywhere</button>
            </GlassCard>
          </>
        )}

        {section === "notifications" && (
          <>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)" }}>Notifications</h1>
            {[
              { label: "Email on PKG approved", on: true },
              { label: "Email on forum replies", on: true },
              { label: "Email digest (weekly)", on: false },
            ].map((t) => (
              <GlassCard key={t.label} padding="12px 14px" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-primary)" }}>{t.label}</span>
                <div style={{
                  width: 36, height: 20, borderRadius: 10, cursor: "pointer",
                  background: t.on ? "var(--color-accent)" : "rgba(255,255,255,0.1)",
                  position: "relative",
                }}>
                  <div style={{ position: "absolute", top: 2, left: t.on ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </div>
              </GlassCard>
            ))}
          </>
        )}

        {section === "privacy" && (
          <>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)" }}>Privacy</h1>
            {[
              { label: "Show email on profile", on: false },
              { label: "Appear in member directory", on: true },
              { label: "Allow direct messages", on: true },
            ].map((t) => (
              <GlassCard key={t.label} padding="12px 14px" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-primary)" }}>{t.label}</span>
                <div style={{
                  width: 36, height: 20, borderRadius: 10, cursor: "pointer",
                  background: t.on ? "var(--color-accent)" : "rgba(255,255,255,0.1)",
                  position: "relative",
                }}>
                  <div style={{ position: "absolute", top: 2, left: t.on ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </div>
              </GlassCard>
            ))}
          </>
        )}

        {section === "danger" && (
          <>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-danger)" }}>Danger Zone</h1>
            <div style={{ padding: 18, borderRadius: 10, border: "1px solid rgba(239, 68, 68, 0.2)", background: "rgba(239, 68, 68, 0.04)" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 8 }}>Delete account</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: 16 }}>
                This will permanently delete your account, contributions, and forum posts. This action cannot be undone.
              </p>
              <button className="btn-secondary" style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)" }} onClick={handleDeleteAccount}>
                Delete my account
              </button>
            </div>
          </>
        )}

        {/* Save bar (account only) */}
        {section === "account" && hasChanges && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 18px", borderRadius: 10,
            background: "rgba(99, 102, 241, 0.06)", border: "1px solid rgba(99, 102, 241, 0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: "var(--color-accent)" }} />
              <span style={{ fontSize: "0.85rem", color: "var(--color-text-primary)" }}>You have unsaved changes</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {feedback && <span style={{ fontSize: "0.8rem", color: feedback.startsWith("✓") ? "var(--color-success)" : "var(--color-danger)", alignSelf: "center" }}>{feedback}</span>}
              <button className="btn-ghost" onClick={() => { setName(initialUser.name); setEmail(initialUser.email); setBio(""); }}>Discard</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.5 : 1 }}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
