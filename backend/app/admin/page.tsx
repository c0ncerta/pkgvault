import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/liquid/glass";
import { IconAlertTriangle, IconQueue, IconCatalog, IconLink } from "@/components/ui/icons";
import type { ReactNode } from "react";
import { db } from "@/lib/db";
import { pkgFiles, pkgSources, users, forumThreads, linkReports } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

async function getStats() {
  try {
    const [pkgStats] = await db.select({
      total: sql<number>`count(*)`,
      approved: sql<number>`count(*) filter (where ${pkgFiles.status} = 'approved')`,
      pending: sql<number>`count(*) filter (where ${pkgFiles.status} = 'pending')`,
      rejected: sql<number>`count(*) filter (where ${pkgFiles.status} = 'rejected')`,
      takenDown: sql<number>`count(*) filter (where ${pkgFiles.status} = 'taken_down')`,
      totalDownloads: sql<number>`coalesce(sum(${pkgFiles.downloadCount}), 0)`,
    }).from(pkgFiles).where(sql`${pkgFiles.deletedAt} IS NULL`);

    const [sourceStats] = await db.select({
      total: sql<number>`count(*)`,
      alive: sql<number>`count(*) filter (where ${pkgSources.status} = 'alive')`,
      dead: sql<number>`count(*) filter (where ${pkgSources.status} = 'dead')`,
      unknown: sql<number>`count(*) filter (where ${pkgSources.status} = 'unknown')`,
    }).from(pkgSources);

    const [userStats] = await db.select({
      total: sql<number>`count(*)`,
    }).from(users);

    const [forumStats] = await db.select({
      threads: sql<number>`count(*)`,
    }).from(forumThreads);

    const [reportStats] = await db.select({
      open: sql<number>`count(*) filter (where ${linkReports.resolved} = false)`,
    }).from(linkReports);

    return {
      pkg: pkgStats ?? { total: 0, approved: 0, pending: 0, rejected: 0, takenDown: 0, totalDownloads: 0 },
      sources: sourceStats ?? { total: 0, alive: 0, dead: 0, unknown: 0 },
      users: userStats ?? { total: 0 },
      forum: forumStats ?? { threads: 0 },
      reports: reportStats ?? { open: 0 },
    };
  } catch {
    return {
      pkg: { total: 0, approved: 0, pending: 0, rejected: 0, takenDown: 0, totalDownloads: 0 },
      sources: { total: 0, alive: 0, dead: 0, unknown: 0 },
      users: { total: 0 },
      forum: { threads: 0 },
      reports: { open: 0 },
    };
  }
}

export default async function AdminOverview() {
  const stats = await getStats();

  const statCards = [
    { label: "Total PKGs", value: stats.pkg.total, color: "#818cf8" },
    { label: "Approved", value: stats.pkg.approved, color: "#34d399" },
    { label: "Pending Review", value: stats.pkg.pending, color: "#fbbf24", href: "/admin/queue" },
    { label: "Downloads", value: stats.pkg.totalDownloads, color: "#60a5fa" },
  ];

  const sourceCards = [
    { label: "Total Sources", value: stats.sources.total, color: "#818cf8" },
    { label: "Alive", value: stats.sources.alive, color: "#34d399" },
    { label: "Dead", value: stats.sources.dead, color: "#f87171", href: "/admin/sources?status=dead" },
    { label: "Unknown", value: stats.sources.unknown, color: "var(--color-text-muted)" },
  ];

  const alerts: { text: string; type: "warning" | "error"; href: string }[] = [];
  if (stats.pkg.pending > 0) alerts.push({ text: `${stats.pkg.pending} PKGs pending review`, type: "warning", href: "/admin/queue" });
  if (stats.sources.dead > 0) alerts.push({ text: `${stats.sources.dead} dead sources need fixing`, type: "error", href: "/admin/sources?status=dead" });
  if (stats.reports.open > 0) alerts.push({ text: `${stats.reports.open} open link reports`, type: "warning", href: "/admin/sources?tab=reports" });

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.03em", marginBottom: 4 }}>
        Dashboard
      </h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: 32 }}>
        System overview — {stats.users.total} users · {stats.forum.threads} threads
      </p>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
          {alerts.map((a, i) => (
            <Link key={i} href={a.href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px", borderRadius: 12, textDecoration: "none",
              background: a.type === "error" ? "rgba(248, 113, 113, 0.08)" : "rgba(251, 191, 36, 0.08)",
              border: `1px solid ${a.type === "error" ? "rgba(248, 113, 113, 0.2)" : "rgba(251, 191, 36, 0.2)"}`,
              color: a.type === "error" ? "#fca5a5" : "#fde68a",
              fontSize: "0.85rem", fontWeight: 500,
            }}>
              <span style={{ display: "flex", alignItems: "center" }}>{a.type === "error" ? <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f87171", display: "inline-block" }} /> : <IconAlertTriangle size={16} />}</span>
              {a.text}
              <span style={{ marginLeft: "auto", fontSize: "0.75rem", opacity: 0.6 }}>→</span>
            </Link>
          ))}
        </div>
      )}

      {/* PKG Stats */}
      <h3 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
        Packages
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Source Stats */}
      <h3 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
        Download Sources
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        {sourceCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <h3 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
        Quick Actions
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <QuickAction href="/admin/queue" icon={<IconQueue size={24} />} label="Review Queue" desc={`${stats.pkg.pending} pending`} />
        <QuickAction href="/admin/pkgs" icon={<IconCatalog size={24} />} label="Manage PKGs" desc="Add, edit, remove" />
        <QuickAction href="/admin/sources" icon={<IconLink size={24} />} label="Link Health" desc="Check & fix sources" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color, href }: { label: string; value: number; color: string; href?: string }) {
  const inner = (
    <GlassCard variant="content" cornerRadius={16} padding="18px 20px" style={{ cursor: href ? "pointer" : "default" }}>
      <div style={{ fontSize: "1.75rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: 500, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </div>
    </GlassCard>
  );

  if (href) return <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link>;
  return inner;
}

function QuickAction({ href, icon, label, desc }: { href: string; icon: ReactNode; label: string; desc: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <GlassCard variant="content" cornerRadius={16} padding="20px">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent-hover)" }}>{icon}</span>
          <div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{label}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{desc}</div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
