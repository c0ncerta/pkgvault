"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Shared tab bar for grouped admin sections (e.g. Catalog & Sources, Mirrors).
 * Each tab is its own route; this just links between them and highlights the
 * active one. Reuses the segmented-pill capsule for visual consistency.
 */
export function SectionTabs({ tabs }: { tabs: Array<{ label: string; href: string }> }) {
  const pathname = usePathname();
  return (
    <div className="segmented-shell" style={{ marginBottom: "var(--space-16)", flexWrap: "wrap" }}>
      {tabs.map((t) => {
        const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            className="segmented-pill"
            data-active={active}
            style={{ textDecoration: "none" }}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
