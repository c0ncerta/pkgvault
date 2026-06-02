import { forumThreads, users } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import Link from "next/link";

const getLatestThreads = unstable_cache(
  async () => {
    const rows = await db
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

    return rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      lastPostAt: row.lastPostAt?.toISOString() ?? null,
    }));
  },
  ["home-latest-threads"],
  { revalidate: 30, tags: ["forum"] },
);
import { GlassCard } from "@/components/liquid/glass";
import { IconFire, IconForum, IconPin } from "@/components/ui/icons";
import { Tag } from "@/components/ui/tag";

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export async function HomeForumStrip() {
  let threads: Array<{
    id: string;
    title: string;
    category: string;
    postCount: number;
    isPinned: boolean;
    createdAt: string;
    lastPostAt: string | null;
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "var(--fs-xs)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--color-success-bright)",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Discussion
          </div>
          <h2
            style={{
              fontSize: "var(--fs-3xl)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
            }}
          >
            Latest forum threads
          </h2>
        </div>
        <Link href="/forum" className="btn-ghost" style={{ fontSize: "var(--fs-md)" }}>
          View forum →
        </Link>
      </div>

      <GlassCard padding="0" style={{ overflow: "hidden" }}>
        {threads.map((t, i) => (
          <Link
            key={t.id}
            href={`/forum/${t.id}`}
            className={`animate-fade-in delay-${Math.min(i + 1, 6)}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              textDecoration: "none",
              borderBottom: i < threads.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              background: t.isPinned ? "rgba(245, 158, 11, 0.03)" : "transparent",
              transition: "background var(--dur-fast)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <span
                style={{
                  width: 22,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: t.isPinned
                    ? "var(--color-warning-bright)"
                    : t.postCount > 5
                      ? "#fb923c"
                      : "var(--color-text-muted)",
                }}
              >
                {t.isPinned ? (
                  <IconPin size={14} />
                ) : t.postCount > 5 ? (
                  <IconFire size={14} />
                ) : (
                  <IconForum size={14} />
                )}
              </span>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "var(--fs-lg)",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.title}
                </div>
                <div
                  style={{
                    fontSize: "var(--fs-xs)",
                    color: "var(--color-text-muted)",
                    marginTop: 2,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  @{t.author ?? "anon"} · {timeAgo(t.lastPostAt ?? t.createdAt)} ago
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
              <Tag>{t.category}</Tag>
              <span
                style={{
                  fontSize: "var(--fs-sm)",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                  minWidth: 32,
                  textAlign: "right",
                }}
              >
                {t.postCount}
              </span>
            </div>
          </Link>
        ))}
      </GlassCard>
    </section>
  );
}
