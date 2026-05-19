import { Navbar } from "@/components/layout/navbar";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session: Awaited<ReturnType<typeof getServerSession>> = null;
  try {
    session = await getServerSession();
  } catch {
    // DB offline
  }

  if (!session) {
    redirect("/login?callbackUrl=/profile");
  }

  const userRole = (session.user as { role?: string }).role ?? "user";

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 64px" }}>
        {/* Dashboard sidebar nav */}
        <div
          className="toolbar-shell"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 24,
            paddingBottom: 12,
            paddingTop: 12,
            paddingLeft: 18,
            paddingRight: 18,
          }}
        >
          <DashLink href="/profile" label="Profile" />
          <DashLink href="/settings" label="Settings" />
          {(userRole === "admin" || userRole === "mod") && (
            <DashLink href="/admin" label="Admin" accent />
          )}
        </div>
        {children}
      </div>
    </>
  );
}

function DashLink({ href, label, accent }: { href: string; label: string; accent?: boolean }) {
  return (
    <a
      href={href}
      className="btn-ghost"
      style={{
        padding: "8px 16px",
        fontSize: "0.85rem",
        color: accent ? "var(--color-warning)" : undefined,
      }}
    >
      {label}
    </a>
  );
}
