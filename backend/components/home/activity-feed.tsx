import { forumThreads, pkgFiles, users } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import Link from "next/link";

const getActivity = unstable_cache(
  async () => {
    return await Promise.all([
      db
        .select({
          id: pkgFiles.id,
          title: pkgFiles.title,
          user: users.name,
          createdAt: pkgFiles.createdAt,
        })
        .from(pkgFiles)
        .leftJoin(users, eq(pkgFiles.uploaderId, users.id))
        .where(sql`${pkgFiles.deletedAt} IS NULL AND ${pkgFiles.status} = 'approved'`)
        .orderBy(desc(pkgFiles.createdAt))
        .limit(6),
      db
        .select({
          id: forumThreads.id,
          title: forumThreads.title,
          user: users.name,
          createdAt: forumThreads.createdAt,
        })
        .from(forumThreads)
        .leftJoin(users, eq(forumThreads.authorId, users.id))
        .where(sql`${forumThreads.deletedAt} IS NULL`)
        .orderBy(desc(forumThreads.createdAt))
        .limit(6),
    ]);
  },
  ["home-activity-feed"],
  { revalidate: 30, tags: ["pkgs", "forum"] },
);
import { GlassCard } from "@/components/liquid/glass";
import { IconForum, IconUpload } from "@/components/ui/icons";

type ActivityItem =
  | { kind: "pkg"; id: string; title: string; user: string | null; createdAt: Date }
  | { kind: "thread"; id: string; title: string; user: string | null; createdAt: Date };

function timeAgo(d: Date): string {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export async function HomeActivityFeed() {
  let pkgs: Array<{ id: string; title: string; user: string | null; createdAt: Date }> = [];
  let threads: Array<{ id: string; title: string; user: string | null; createdAt: Date }> = [];

  try {
    [pkgs, threads] = await getActivity();
  } catch {
    // DB offline
  }

  const items: ActivityItem[] = [
    ...pkgs.map((p) => ({ kind: "pkg" as const, ...p })),
    ...threads.map((t) => ({ kind: "thread" as const, ...t })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  if (items.length === 0) return null;

  return (
    <GlassCard padding="22px 24px" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--color-success)",
              boxShadow: "0 0 12px var(--color-success)",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          Live activity
        </h3>
        <span
          style={{
            fontSize: "0.7rem",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          last 24h
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((it) => {
          const href = it.kind === "pkg" ? `/catalog/${it.id}` : `/forum/${it.id}`;
          const Icon = it.kind === "pkg" ? IconUpload : IconForum;
          const tint = it.kind === "pkg" ? "#818cf8" : "#34d399";
          const verb = it.kind === "pkg" ? "uploaded" : "started";
          return (
            <Link
              key={`${it.kind}-${it.id}`}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 10,
                textDecoration: "none",
                color: "var(--color-text-primary)",
                fontSize: "0.85rem",
                transition: "background 0.15s",
              }}
            >
              <span
                style={{
                  width: 18,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: tint,
                }}
              >
                <Icon size={14} />
              </span>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: "var(--color-accent-hover)", fontWeight: 500 }}>
                  @{it.user ?? "anon"}
                </span>
                <span style={{ color: "var(--color-text-muted)" }}> {verb} </span>
                <span style={{ color: "var(--color-text-primary)" }}>{it.title}</span>
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                  whiteSpace: "nowrap",
                }}
              >
                {timeAgo(it.createdAt)}
              </span>
            </Link>
          );
        })}
      </div>
    </GlassCard>
  );
}
