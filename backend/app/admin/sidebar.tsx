"use client";

import {
  IconArrowLeft,
  IconCatalog,
  IconClipboard,
  IconCloud,
  IconDashboard,
  IconHardDrive,
  IconLink,
  IconQueue,
  IconUsers,
} from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Overview", icon: IconDashboard },
  { href: "/admin/queue", label: "Mod Queue", icon: IconQueue },
  { href: "/admin/pkgs", label: "PKG Manager", icon: IconCatalog },
  { href: "/admin/sources", label: "Link Health", icon: IconLink },
  { href: "/admin/backups", label: "GDrive Backups", icon: IconHardDrive },
  { href: "/admin/drives", label: "Drive Accounts", icon: IconCloud },
  { href: "/admin/users", label: "Users", icon: IconUsers },
  { href: "/admin/audit", label: "Audit Log", icon: IconClipboard },
];

export function AdminSidebar({ role, userName }: { role: string; userName: string }) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        borderRight: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10, 10, 14, 0.95)",
        backdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        gap: 4,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "0 12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 12,
        }}
      >
        <Link
          href="/"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}
        >
          <Logo size={26} />
          <span
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Admin Panel
          </span>
        </Link>
      </div>

      {/* Nav */}
      {navItems.map((item) => {
        const active =
          pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 12,
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: active ? 600 : 500,
              color: active ? "var(--color-text-primary)" : "var(--color-text-muted)",
              background: active
                ? "linear-gradient(180deg, rgba(99, 102, 241, 0.18), rgba(99, 102, 241, 0.06))"
                : "transparent",
              border: `1px solid ${active ? "rgba(99, 102, 241, 0.25)" : "transparent"}`,
              boxShadow: active
                ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 8px rgba(99, 102, 241, 0.18)"
                : undefined,
            }}
          >
            {active && (
              <span
                style={{
                  position: "absolute",
                  left: -16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 3,
                  height: 18,
                  borderRadius: 3,
                  background: "linear-gradient(180deg, #818cf8, #a78bfa)",
                  boxShadow: "0 0 10px rgba(129, 140, 248, 0.6)",
                }}
              />
            )}
            <Icon
              size={16}
              style={{ opacity: active ? 1 : 0.6, color: active ? "#a78bfa" : undefined }}
            />
            {item.label}
          </Link>
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User info */}
      <div
        style={{
          padding: "14px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 11,
              color: "#fff",
            }}
          >
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div
              style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-primary)" }}
            >
              {userName}
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                color: "#818cf8",
                textTransform: "uppercase",
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              {role}
            </div>
          </div>
        </div>
      </div>

      {/* Back to site */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: "center",
          padding: "10px 14px",
          borderRadius: 10,
          marginTop: 8,
          textDecoration: "none",
          fontSize: "0.8rem",
          color: "var(--color-text-muted)",
          fontWeight: 500,
        }}
      >
        <IconArrowLeft size={14} />
        Back to site
      </Link>
    </aside>
  );
}
