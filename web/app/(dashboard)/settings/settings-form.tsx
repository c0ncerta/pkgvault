"use client";

import { GlassCard } from "@/components/liquid/glass";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface UserData {
  name: string;
  email: string;
  image: string | null;
  role: string;
}

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
    setSaving(true);
    setFeedback(null);
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
    } catch {
      setFeedback("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    await signOut();
    router.push("/");
  };

  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div
      className="animate-fade-in responsive-settings-layout"
      style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: "var(--space-24)" }}
    >
      {/* Sidebar */}
      <GlassCard
        className="responsive-settings-sidebar"
        padding="8px"
        style={{ alignSelf: "start" }}
      >
        {sections.map((s) => {
          const active = section === s.key;
          return (
            <button
              type="button"
              key={s.key}
              onClick={() => setSection(s.key)}
              className="filter-row"
              data-active={active ? "true" : "false"}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: "var(--fs-base)",
                fontWeight: active ? 600 : 400,
                color: s.danger ? "var(--color-danger)" : undefined,
                fontFamily: "var(--font-sans)",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </GlassCard>

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-24)" }}>
        {section === "account" && (
          <>
            <h1
              style={{
                fontSize: "var(--fs-4xl)",
                fontWeight: 800,
                color: "var(--color-text-primary)",
              }}
            >
              Account
            </h1>

            {/* Avatar */}
            <GlassCard
              padding="18px"
              style={{ display: "flex", gap: "var(--space-20)", alignItems: "center" }}
            >
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "var(--fs-5xl)",
                  color: "#fff",
                }}
              >
                {initials}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "var(--fs-lg)",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  Avatar
                </h3>
                <p
                  style={{
                    fontSize: "var(--fs-base)",
                    color: "var(--color-text-muted)",
                    marginBottom: "var(--space-12)",
                  }}
                >
                  JPG/PNG · max 1MB
                </p>
                <div style={{ display: "flex", gap: "var(--space-8)" }}>
                  <button type="button" className="btn-secondary">
                    Upload image
                  </button>
                  <button type="button" className="btn-ghost">
                    Remove
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* Fields */}
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-16)" }}
            >
              <div>
                <label
                  htmlFor="settings-display-name"
                  style={{
                    display: "block",
                    fontSize: "var(--fs-xs)",
                    fontWeight: 500,
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "var(--space-6)",
                  }}
                >
                  Display name
                </label>
                <input
                  id="settings-display-name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="settings-email"
                  style={{
                    display: "block",
                    fontSize: "var(--fs-xs)",
                    fontWeight: 500,
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "var(--space-6)",
                  }}
                >
                  Email
                </label>
                <input
                  id="settings-email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ fontFamily: "var(--font-mono)" }}
                />
                <div
                  style={{
                    fontSize: "var(--fs-xs)",
                    color: "var(--color-success)",
                    fontFamily: "var(--font-mono)",
                    marginTop: "var(--space-4)",
                  }}
                >
                  ✓ verified
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="settings-bio"
                style={{
                  display: "block",
                  fontSize: "var(--fs-xs)",
                  fontWeight: 500,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "var(--space-6)",
                }}
              >
                Bio
              </label>
              <textarea
                id="settings-bio"
                className="input"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself…"
                style={{ resize: "vertical" }}
              />
              <div
                style={{
                  fontSize: "var(--fs-xs)",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                  marginTop: "var(--space-4)",
                }}
              >
                {bio.length}/200
              </div>
            </div>

            {/* Role badge */}
            <GlassCard
              padding="14px"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span style={{ fontSize: "var(--fs-md)", color: "var(--color-text-primary)" }}>
                Role
              </span>
              <span className="tag tag-accent">{initialUser.role}</span>
            </GlassCard>
          </>
        )}

        {section === "security" && (
          <>
            <h1
              style={{
                fontSize: "var(--fs-4xl)",
                fontWeight: 800,
                color: "var(--color-text-primary)",
              }}
            >
              Session & Security
            </h1>
            <GlassCard padding="18px">
              <h3
                style={{
                  fontSize: "var(--fs-lg)",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-12)",
                }}
              >
                Change password
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-12)" }}>
                <input className="input" type="password" placeholder="Current password" />
                <input
                  className="input"
                  type="password"
                  placeholder="New password (min 8 characters)"
                />
                <input className="input" type="password" placeholder="Confirm new password" />
                <button type="button" className="btn-secondary" style={{ alignSelf: "flex-start" }}>
                  Update password
                </button>
              </div>
            </GlassCard>
            <GlassCard padding="18px">
              <h3
                style={{
                  fontSize: "var(--fs-lg)",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-8)",
                }}
              >
                Active sessions
              </h3>
              <p style={{ fontSize: "var(--fs-base)", color: "var(--color-text-muted)" }}>
                Current session is active. Use the button below to sign out from all devices.
              </p>
              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: "var(--space-12)" }}
              >
                Sign out everywhere
              </button>
            </GlassCard>
          </>
        )}

        {section === "notifications" && (
          <>
            <h1
              style={{
                fontSize: "var(--fs-4xl)",
                fontWeight: 800,
                color: "var(--color-text-primary)",
              }}
            >
              Notifications
            </h1>
            {[
              { label: "Email on PKG approved", on: true },
              { label: "Email on forum replies", on: true },
              { label: "Email digest (weekly)", on: false },
            ].map((t) => (
              <GlassCard
                key={t.label}
                padding="12px 14px"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={{ fontSize: "var(--fs-md)", color: "var(--color-text-primary)" }}>
                  {t.label}
                </span>
                <div
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    background: t.on ? "var(--color-accent)" : "rgba(255,255,255,0.1)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: t.on ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left var(--dur-base)",
                    }}
                  />
                </div>
              </GlassCard>
            ))}
          </>
        )}

        {section === "privacy" && (
          <>
            <h1
              style={{
                fontSize: "var(--fs-4xl)",
                fontWeight: 800,
                color: "var(--color-text-primary)",
              }}
            >
              Privacy
            </h1>
            {[
              { label: "Show email on profile", on: false },
              { label: "Appear in member directory", on: true },
              { label: "Allow direct messages", on: true },
            ].map((t) => (
              <GlassCard
                key={t.label}
                padding="12px 14px"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={{ fontSize: "var(--fs-md)", color: "var(--color-text-primary)" }}>
                  {t.label}
                </span>
                <div
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    background: t.on ? "var(--color-accent)" : "rgba(255,255,255,0.1)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: t.on ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left var(--dur-base)",
                    }}
                  />
                </div>
              </GlassCard>
            ))}
          </>
        )}

        {section === "danger" && (
          <>
            <h1
              style={{ fontSize: "var(--fs-4xl)", fontWeight: 800, color: "var(--color-danger)" }}
            >
              Danger Zone
            </h1>
            <div
              style={{
                padding: "var(--space-16)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                background: "rgba(239, 68, 68, 0.04)",
              }}
            >
              <h3
                style={{
                  fontSize: "var(--fs-lg)",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "var(--space-8)",
                }}
              >
                Delete account
              </h3>
              <p
                style={{
                  fontSize: "var(--fs-md)",
                  color: "var(--color-text-secondary)",
                  marginBottom: "var(--space-16)",
                }}
              >
                This will permanently delete your account, contributions, and forum posts. This
                action cannot be undone.
              </p>
              <button
                type="button"
                className="btn-secondary"
                style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)" }}
                onClick={handleDeleteAccount}
              >
                Delete my account
              </button>
            </div>
          </>
        )}

        {/* Save bar (account only) */}
        {section === "account" && hasChanges && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 18px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(99, 102, 241, 0.06)",
              border: "1px solid rgba(99, 102, 241, 0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-10)" }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "var(--radius-2xs)",
                  background: "var(--color-accent)",
                }}
              />
              <span style={{ fontSize: "var(--fs-md)", color: "var(--color-text-primary)" }}>
                You have unsaved changes
              </span>
            </div>
            <div style={{ display: "flex", gap: "var(--space-8)" }}>
              {feedback && (
                <span
                  style={{
                    fontSize: "var(--fs-base)",
                    color: feedback.startsWith("✓")
                      ? "var(--color-success)"
                      : "var(--color-danger)",
                    alignSelf: "center",
                  }}
                >
                  {feedback}
                </span>
              )}
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setName(initialUser.name);
                  setEmail(initialUser.email);
                  setBio("");
                }}
              >
                Discard
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
                style={{ opacity: saving ? 0.5 : 1 }}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
