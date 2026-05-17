import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Tag } from "@/components/ui/tag";
import { GlassCard } from "@/components/liquid/glass";
import { IconPin, IconFire, IconLock, IconForum } from "@/components/ui/icons";
import { db } from "@/lib/db";
import { forumThreads, forumPosts, users } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Forum",
  description: "PKGVault community forum — scene news, jailbreak, troubleshoot",
};

const categoryLabels: Record<string, string> = {
  general: "General",
  jailbreak: "Jailbreak",
  troubleshoot: "Troubleshoot",
  scene_news: "Scene News",
  releases: "Releases",
  off_topic: "Off-topic",
};

interface ForumPageProps {
  searchParams: Promise<{ cat?: string; sort?: string }>;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.floor(diff / 60000)}m`;
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default async function ForumPage({ searchParams }: ForumPageProps) {
  const params = await searchParams;
  const activeCat = params.cat ?? "";
  const sort = params.sort ?? "recent";

  let threads: Array<{
    id: string; title: string; category: string;
    isPinned: boolean; isLocked: boolean; postCount: number;
    createdAt: Date; lastPostAt: Date | null;
    authorName: string | null;
  }> = [];
  let categoryCounts: Record<string, number> = {};

  try {
    const conditions = [sql`${forumThreads.deletedAt} IS NULL`];
    if (activeCat && activeCat in categoryLabels) {
      conditions.push(eq(forumThreads.category, activeCat as "general"));
    }

    const orderBy = sort === "popular"
      ? desc(forumThreads.postCount)
      : desc(sql`coalesce(${forumThreads.lastPostAt}, ${forumThreads.createdAt})`);

    const [threadData, catData] = await Promise.all([
      db
        .select({
          id: forumThreads.id, title: forumThreads.title,
          category: forumThreads.category, isPinned: forumThreads.isPinned,
          isLocked: forumThreads.isLocked, postCount: forumThreads.postCount,
          createdAt: forumThreads.createdAt, lastPostAt: forumThreads.lastPostAt,
          authorName: users.name,
        })
        .from(forumThreads)
        .leftJoin(users, eq(forumThreads.authorId, users.id))
        .where(and(...conditions))
        .orderBy(desc(forumThreads.isPinned), orderBy)
        .limit(30),
      db
        .select({
          category: forumThreads.category,
          count: sql<number>`count(*)`,
        })
        .from(forumThreads)
        .where(sql`${forumThreads.deletedAt} IS NULL`)
        .groupBy(forumThreads.category),
    ]);

    threads = threadData;
    for (const row of catData) {
      categoryCounts[row.category] = row.count;
    }
  } catch {
    // DB offline — show empty
  }

  const totalThreads = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 64px", position: "relative", zIndex: 1 }}>
        <div className="responsive-sidebar-layout" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
          {/* Sidebar */}
          <GlassCard className="animate-fade-in" padding="20px" style={{ alignSelf: "start" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 14, color: "var(--color-text-primary)" }}>Categories</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Link
                href="/forum"
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 12px", borderRadius: 14, textDecoration: "none",
                  background: !activeCat ? "rgba(99, 102, 241, 0.08)" : "transparent",
                  border: !activeCat ? "1px solid rgba(99, 102, 241, 0.15)" : "1px solid transparent",
                  fontSize: "0.875rem", color: "var(--color-text-primary)",
                }}
              >
                <span>All</span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>{totalThreads}</span>
              </Link>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <Link
                  key={key}
                  href={`/forum?cat=${key}`}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 12px", borderRadius: 14, textDecoration: "none",
                    background: activeCat === key ? "rgba(99, 102, 241, 0.08)" : "transparent",
                    border: activeCat === key ? "1px solid rgba(99, 102, 241, 0.15)" : "1px solid transparent",
                    fontSize: "0.875rem", color: "var(--color-text-primary)", transition: "background 0.15s",
                  }}
                >
                  <span>{label}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                    {categoryCounts[key] ?? 0}
                  </span>
                </Link>
              ))}
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />
            <Link href="/forum/new" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              + New Thread
            </Link>
          </GlassCard>

          {/* Threads */}
          <div className="animate-fade-in delay-1">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
                {activeCat ? categoryLabels[activeCat] ?? "Threads" : "All Threads"}
              </h1>
              <div style={{ display: "flex", gap: 6 }}>
                {["recent", "popular"].map((s) => (
                  <Link
                    key={s}
                    href={`/forum?${new URLSearchParams({ ...(activeCat && { cat: activeCat }), ...(s !== "recent" && { sort: s }) })}`}
                    className="tag"
                    style={{
                      cursor: "pointer", textDecoration: "none",
                      borderColor: sort === s ? "var(--color-accent)" : undefined,
                      color: sort === s ? "var(--color-accent-hover)" : undefined,
                    }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Link>
                ))}
              </div>
            </div>

            {threads.length > 0 ? (
              <GlassCard padding="0" style={{ overflow: "hidden" }}>
                {threads.map((t, i) => (
                  <Link key={t.id} href={`/forum/${t.id}`} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 18px", textDecoration: "none",
                    borderBottom: i < threads.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    background: t.isPinned ? "rgba(99, 102, 241, 0.03)" : "transparent",
                    transition: "background 0.15s",
                  }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
                      <span style={{ width: 24, textAlign: "center", fontSize: 14 }}>
                        {t.isPinned ? <IconPin size={14} /> : t.postCount > 10 ? <IconFire size={14} /> : ""}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: t.isPinned ? 600 : 500, color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                          {t.title}
                          {t.isLocked && <Tag><IconLock size={12} /></Tag>}
                          {t.postCount > 10 && <Tag variant="accent">hot</Tag>}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 3, fontFamily: "var(--font-mono)" }}>
                          @{t.authorName ?? "anon"} · {categoryLabels[t.category] ?? t.category} · {timeAgo(t.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "center", flexShrink: 0, paddingLeft: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text-primary)" }}>{t.postCount}</div>
                      <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>replies</div>
                    </div>
                  </Link>
                ))}
              </GlassCard>
            ) : (
              <GlassCard padding="60px 40px" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 16, opacity: 0.3 }}><IconForum size={40} /></div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 8 }}>No threads yet</h2>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: 20 }}>Start the conversation.</p>
                <Link href="/forum/new" className="btn-primary">+ New Thread</Link>
              </GlassCard>
            )}
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
