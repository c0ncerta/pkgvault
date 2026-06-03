import { SectionTabs } from "@/components/admin/section-tabs";
import { pkgFiles, pkgSources } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { LinkHealthManager } from "./link-health-manager";
import type { LinkHealthSource } from "./link-health-manager";

export const metadata: Metadata = { title: "Link Health" };

export default async function SourcesPage() {
  let sources: LinkHealthSource[] = [];

  try {
    sources = (
      await db
        .select({
          id: pkgSources.id,
          url: pkgSources.url,
          provider: pkgSources.provider,
          status: pkgSources.status,
          label: pkgSources.label,
          isPrimary: pkgSources.isPrimary,
          failCount: pkgSources.failCount,
          downloadCount: pkgSources.downloadCount,
          lastCheckedAt: pkgSources.lastCheckedAt,
          createdAt: pkgSources.createdAt,
          pkgTitle: pkgFiles.title,
          pkgId: pkgFiles.id,
        })
        .from(pkgSources)
        .leftJoin(pkgFiles, eq(pkgSources.pkgId, pkgFiles.id))
        .orderBy(desc(pkgSources.createdAt))
        .limit(200)
    ).map((r) => ({
      ...r,
      status: r.status,
      lastCheckedAt: r.lastCheckedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      pkgTitle: r.pkgTitle ?? "Unknown PKG",
      pkgId: r.pkgId ?? "",
    }));
  } catch {
    // DB offline
  }

  return (
    <div className="animate-fade-in">
      <SectionTabs
        tabs={[
          { label: "PKGs", href: "/admin/pkgs" },
          { label: "Sources & Health", href: "/admin/sources" },
          { label: "Find / Scrape", href: "/admin/sources/find" },
        ]}
      />
      <LinkHealthManager sources={sources} />
    </div>
  );
}
