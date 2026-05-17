import { ReplyForm } from "@/components/forum/reply-form";
import { VoteButton } from "@/components/forum/vote-button";
import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/liquid/glass";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { IconLock, IconPin } from "@/components/ui/icons";
import { Tag } from "@/components/ui/tag";
import { forumPosts, forumThreads, users } from "@/db/schema";
import { db } from "@/lib/db";
import { and, asc, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface ThreadPageProps {
  params: Promise<{ threadId: string }>;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export async function generateMetadata({ params }: ThreadPageProps): Promise<Metadata> {
  const { threadId } = await params;
  try {
    const [t] = await db
      .select({ title: forumThreads.title })
      .from(forumThreads)
      .where(eq(forumThreads.id, threadId))
      .limit(1);
    return { title: t?.title ?? "Thread" };
  } catch {
    return { title: "Forum Thread" };
  }
}

export default async function ForumThreadPage({ params }: ThreadPageProps) {
  const { threadId } = await params;

  let thread:
    | {
        id: string;
        title: string;
        category: string;
        isPinned: boolean;
        isLocked: boolean;
        createdAt: Date;
        authorName: string | null;
      }
    | undefined;
  let posts: Array<{
    id: string;
    bodyMd: string;
    score: number;
    depth: number;
    createdAt: Date;
    authorName: string | null;
    authorRole: string | null;
  }> = [];

  try {
    const [t] = await db
      .select({
        id: forumThreads.id,
        title: forumThreads.title,
        category: forumThreads.category,
        isPinned: forumThreads.isPinned,
        isLocked: forumThreads.isLocked,
        createdAt: forumThreads.createdAt,
        authorName: users.name,
      })
      .from(forumThreads)
      .leftJoin(users, eq(forumThreads.authorId, users.id))
      .where(and(eq(forumThreads.id, threadId), sql`${forumThreads.deletedAt} IS NULL`))
      .limit(1);

    thread = t;

    if (thread) {
      posts = await db
        .select({
          id: forumPosts.id,
          bodyMd: forumPosts.bodyMd,
          score: forumPosts.score,
          depth: forumPosts.depth,
          createdAt: forumPosts.createdAt,
          authorName: users.name,
          authorRole: users.role,
        })
        .from(forumPosts)
        .leftJoin(users, eq(forumPosts.authorId, users.id))
        .where(and(eq(forumPosts.threadId, threadId), sql`${forumPosts.deletedAt} IS NULL`))
        .orderBy(asc(forumPosts.createdAt))
        .limit(100);
    }
  } catch {
    // DB offline
  }

  if (!thread) return notFound();

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 64px" }}>
        <Breadcrumb
          items={[
            { label: "Forum", href: "/forum" },
            { label: thread.category },
            { label: "Thread" },
          ]}
        />

        <div
          className="animate-fade-in"
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* Header */}
          <GlassCard padding="20px">
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--color-text-primary)",
                    marginBottom: 6,
                  }}
                >
                  {thread.title}
                </h1>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    fontSize: "0.8rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <span>
                    by{" "}
                    <strong style={{ color: "var(--color-text-secondary)" }}>
                      @{thread.authorName ?? "anon"}
                    </strong>
                  </span>
                  <span>·</span>
                  <span>{timeAgo(thread.createdAt)}</span>
                  <span>·</span>
                  <Tag>{thread.category}</Tag>
                  {thread.isPinned && (
                    <Tag variant="accent">
                      <IconPin size={12} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                      pinned
                    </Tag>
                  )}
                  {thread.isLocked && (
                    <Tag variant="warning">
                      <IconLock size={12} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                      locked
                    </Tag>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Posts */}
          {posts.map((p, i) => (
            <GlassCard
              key={p.id}
              className={`animate-slide-up delay-${Math.min(i + 1, 6)}`}
              padding="18px"
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 70px",
                gap: 16,
                marginLeft: Math.min(p.depth, 3) * 32,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))",
                    border: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 6px",
                    fontWeight: 800,
                    color: "rgba(99, 102, 241, 0.6)",
                  }}
                >
                  {(p.authorName ?? "?").slice(0, 2).toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  @{p.authorName ?? "anon"}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {p.authorRole ?? "user"}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                    marginBottom: 8,
                  }}
                >
                  {timeAgo(p.createdAt)} · #{i + 1}
                </div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-primary)",
                    lineHeight: 1.6,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {p.bodyMd}
                </p>
              </div>
              <VoteButton targetType="post" targetId={p.id} initialScore={p.score} />
            </GlassCard>
          ))}

          {/* Reply form */}
          {!thread.isLocked && <ReplyForm threadId={thread.id} />}

          {thread.isLocked && (
            <GlassCard padding="24px 18px" style={{ textAlign: "center" }}>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <IconLock size={14} /> This thread is locked — no new replies.
              </p>
            </GlassCard>
          )}
        </div>
      </main>
    </>
  );
}
