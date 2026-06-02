"use client";

import { IconBell, IconLogout, IconSettings, IconShield, IconUser } from "@/components/ui/icons";
import { signOut } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface UserData {
  name: string;
  email: string;
  role: string;
  image?: string | null;
}

interface AvatarMenuProps {
  user: UserData;
}

export function AvatarMenu({ user }: AvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user.name?.slice(0, 2).toUpperCase() ?? "??";

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const menuItems = [
    { icon: IconUser, label: "Profile", href: "/profile" },
    { icon: IconBell, label: "Notifications", href: "/notifications" },
    { icon: IconSettings, label: "Settings", href: "/settings" },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="User menu"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-10)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <span
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "var(--fs-md)",
            fontWeight: 500,
          }}
        >
          {user.name}
        </span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "var(--fs-base)",
            color: "#fff",
            transition: "box-shadow var(--dur-base)",
            boxShadow: open ? "0 0 0 3px rgba(99, 102, 241, 0.3)" : "none",
          }}
        >
          {user.image ? (
            <img
              src={user.image}
              alt=""
              style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            initials
          )}
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: 280,
            zIndex: 100,
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            background: "rgba(12, 12, 18, 0.94)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
            animation: "fade-in var(--dur-fast) ease-out",
            padding: "var(--space-6)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-12)",
              padding: "14px 14px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              marginBottom: "var(--space-4)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                flexShrink: 0,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "var(--fs-md)",
                color: "#fff",
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "var(--fs-lg)",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontSize: "var(--fs-xs)",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {user.email}
              </div>
              <span
                className="tag tag-accent"
                style={{
                  fontSize: "var(--fs-2xs)",
                  padding: "1px 8px",
                  marginTop: "var(--space-4)",
                  display: "inline-block",
                }}
              >
                {user.role}
              </span>
            </div>
          </div>

          {/* Menu items */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-10)",
                  padding: "9px 14px",
                  borderRadius: "var(--radius-base)",
                  textDecoration: "none",
                  color: "var(--color-text-primary)",
                  fontSize: "var(--fs-md)",
                  transition: "background var(--dur-fast)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon size={15} style={{ color: "var(--color-text-muted)" }} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Admin link */}
          {(user.role === "admin" || user.role === "mod") && (
            <>
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-10)",
                  padding: "9px 14px",
                  borderRadius: "var(--radius-base)",
                  textDecoration: "none",
                  color: "var(--color-warning)",
                  fontSize: "var(--fs-md)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <IconShield size={15} style={{ color: "var(--color-warning)" }} />
                <span>Admin Panel</span>
              </Link>
            </>
          )}

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-10)",
              width: "100%",
              padding: "9px 14px",
              borderRadius: "var(--radius-base)",
              border: "none",
              background: "transparent",
              color: "var(--color-danger)",
              fontSize: "var(--fs-md)",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <IconLogout size={15} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
