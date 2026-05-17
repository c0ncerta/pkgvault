"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/ui/search-bar";
import { AvatarMenu } from "@/components/ui/avatar-menu";
import { GlassCard } from "@/components/liquid/glass";
import { IconCatalog, IconForum, IconUpload, IconMenu, IconX } from "@/components/ui/icons";

interface NavbarClientProps {
  user: {
    name: string;
    email: string;
    role: string;
    image: string | null;
  } | null;
}

const mobileNavItems = [
  { href: "/catalog", label: "Catalog", icon: IconCatalog },
  { href: "/forum", label: "Forum", icon: IconForum },
  { href: "/upload", label: "Upload", icon: IconUpload },
];

export function NavbarClient({ user }: NavbarClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <SearchBar />
      {user ? (
        <AvatarMenu user={user} />
      ) : (
        <>
          <Link href="/login" className="btn-ghost">Sign In</Link>
          <Link href="/register" className="btn-primary">Get Started</Link>
        </>
      )}

      {/* Mobile hamburger — hidden on desktop via CSS */}
      <button
        className="nav-hamburger"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: "none", /* shown via CSS on mobile */
          alignItems: "center", justifyContent: "center",
          width: 40, height: 40, borderRadius: 12,
          border: "none", background: "transparent",
          cursor: "pointer", fontSize: "1.2rem",
          color: "var(--color-text-primary)",
        }}
        aria-label="Menu"
      >
        {mobileOpen ? <IconX size={20} /> : <IconMenu size={20} />}
      </button>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <GlassCard
          variant="elevated"
          cornerRadius={0}
          padding="24px"
          style={{
            position: "fixed", top: 64, left: 0, right: 0, bottom: 0,
            zIndex: 100,
            animation: "fade-in 0.2s ease-out",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", borderRadius: 16,
                    textDecoration: "none", color: "var(--color-text-primary)",
                    fontSize: "1rem", fontWeight: 500,
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />

            {!user ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link href="/login" className="btn-secondary" onClick={() => setMobileOpen(false)} style={{ justifyContent: "center" }}>Sign In</Link>
                <Link href="/register" className="btn-primary" onClick={() => setMobileOpen(false)} style={{ justifyContent: "center" }}>Get Started</Link>
              </div>
            ) : (
              <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 14, color: "#fff",
                }}>
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{user.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>{user.email}</div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
