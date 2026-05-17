import Link from "next/link";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { forumThreads, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

const getLatestThreads = unstable_cache(
  async () => {
    return await db
      .select({
        id: forumThreads.id,
        title: forumThreads.title,
        category: forumThreads.category,
        postCount: forumThreads.postCount,
        isPinned: forumThreads.isPinned,
        createdAt: forumThreads.createdAt,
        lastPostAt: forumThreads.lastPostAt,
        author: users.name,
      })
      .from(forumThreads)
      .leftJoin(users, eq(forumThreads.authorId, users.id))
      .where(sql`${forumThreads.deletedAt} IS NULL`)
      .orderBy(desc(sql`coalesce(${forumThreads.lastPostAt}, ${forumThreads.createdAt})`))
      .limit(5);
  },
  ["home-latest-threads"],
  { revalidate: 30, tags: ["forum"] },
);
import { GlassCard } from "@/components/liquid/glass";
import { Tag } from "@/components/ui/tag";
import { IconPin, IconFire, IconForum } from "@/components/ui/icons";

function timeAgo(d: Date): string {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export async function HomeForumStrip() {
  let threads: Array<{
    id: string; title: string; category: string; postCount: number;
    isPinned: boolean; createdAt: Date; lastPostAt: Date | null;
    author: string | null;
  }> = [];

  try {
    threads = await getLatestThreads();
  } catch {
    // DB offline
  }

  if (threads.length === 0) return null;

  return (
    <section style={{ maxWidth: 1100, margin: "96px auto 0", padding: "0 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#34d399", fontWeight: 600, marginBottom: 4 }}>
            Discussion
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
            Latest forum threads
          </h2>
        </div>
        <Link href="/forum" className="btn-ghost" style={{ fontSize: "0.85rem" }}>
          View forum →
        </Link>
      </div>

      <GlassCard padding="0" style={{ overflow: "hidden" }}>
        {threads.map((t, i) => (
          <Link key={t.id} href={`/forum/${t.id}`} className={`animate-fade-in delay-${Math.min(i + 1, 6)}`} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px", textDecoration: "none",
            borderBottom: i < threads.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            background: t.isPinned ? "rgba(245, 158, 11, 0.03)" : "transparent",
            transition: "background 0.15s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <span style={{ width: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.isPinned ? "#fbbf24" : t.postCount > 5 ? "#fb923c" : "var(--color-text-muted)" }}>
                {t.isPinned ? <IconPin size={14} /> : t.postCount > 5 ? <IconFire size={14} /> : <IconForum size={14} />}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.title}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
                  @{t.author ?? "anon"} · {timeAgo(t.lastPostAt ?? t.createdAt)} ago
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
              <Tag>{t.category}</Tag>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)", minWidth: 32, textAlign: "right" }}>
                {t.postCount}
              </span>
            </div>
          </Link>
        ))}
      </GlassCard>
    </section>
  );
}
