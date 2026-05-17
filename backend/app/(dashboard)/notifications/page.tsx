import { GlassCard } from "@/components/liquid/glass";
import { IconBell } from "@/components/ui/icons";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  // Placeholder — no real notification system yet
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconBell size={18} style={{ color: "var(--color-accent)" }} />
        </div>
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Notifications
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>
            You&apos;re all caught up
          </p>
        </div>
      </div>

      <GlassCard padding="40px 24px" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12, opacity: 0.3 }}>
          <IconBell size={48} />
        </div>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: 8,
          }}
        >
          No notifications yet
        </h2>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--color-text-muted)",
            lineHeight: 1.5,
            maxWidth: 360,
            margin: "0 auto",
          }}
        >
          When someone replies to your posts, approves your uploads, or mentions you — it&apos;ll
          show up here.
        </p>
      </GlassCard>
    </div>
  );
}
