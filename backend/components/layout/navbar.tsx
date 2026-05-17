import { Logo } from "@/components/ui/logo";
import { getServerSession } from "@/lib/session";
import Link from "next/link";
import { NavbarClient } from "./navbar-client";

const navItems = [
  { href: "/catalog", label: "Catalog" },
  { href: "/forum", label: "Forum" },
  { href: "/upload", label: "Upload" },
];

export async function Navbar() {
  let session: Awaited<ReturnType<typeof getServerSession>> = null;
  try {
    session = await getServerSession();
  } catch {
    // DB offline or auth not configured — render as unauthenticated
  }

  const user = session
    ? {
        name: session.user.name ?? "User",
        email: session.user.email ?? "",
        role: (session.user as { role?: string }).role ?? "user",
        image: session.user.image ?? null,
      }
    : null;

  return (
    <header
      className="glass-vibrancy"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderRadius: 0,
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Logo size={30} />
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            PKGVault
          </span>
        </Link>

        {/* Nav links (hidden on mobile via CSS) */}
        <div
          className="nav-links-desktop"
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="btn-ghost"
              style={{ padding: "8px 16px", fontSize: "0.875rem" }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Search + Auth (client interactive parts) */}
        <NavbarClient user={user} />
      </nav>
    </header>
  );
}
