import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer style={{
      marginTop: 64,
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "32px 24px 24px",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Logo size={20} />
          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
            PKGVault v0.1.0
          </span>
        </div>
        <nav style={{ display: "flex", gap: 20, fontSize: "0.75rem" }}>
          <Link href="/rules" style={{ color: "var(--color-text-muted)", textDecoration: "none", transition: "color 0.15s" }}>
            Community Rules
          </Link>
          <Link href="/privacy" style={{ color: "var(--color-text-muted)", textDecoration: "none", transition: "color 0.15s" }}>
            Privacy
          </Link>
          <Link href="/api-docs" style={{ color: "var(--color-text-muted)", textDecoration: "none", transition: "color 0.15s" }}>
            API
          </Link>
        </nav>
      </div>
    </footer>
  );
}
