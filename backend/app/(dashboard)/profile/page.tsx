import { GlassCard } from "@/components/liquid/glass";
import { SpecList } from "@/components/ui/spec-list";
import { Tag } from "@/components/ui/tag";
import { forumPosts, games, pkgFiles } from "@/db/schema";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { and, desc, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { ProfileTabs } from "./profile-tabs";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your PKGVault profile",
};

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session) return null; // Layout handles redirect

  const userId = session.user.id;
  const userName = session.user.name ?? "User";
  const userRole = (session.user as { role?: string }).role ?? "user";
  const _userEmail = session.user.email ?? "";

  let stats = { pkgsTotal: 0, pkgsApproved: 0, pkgsPending: 0, forumPosts: 0 };
  let pkgs: Array<{
    id: string;
    title: string;
    version: string | null;
    sizeBytes: bigint;
    status: string;
    downloadCount: number;
    createdAt: Date;
    gamePlatform: string | null;
  }> = [];
  let posts: Array<{
    id: string;
    bodyMd: string;
    score: number;
    createdAt: Date;
    threadTitle: string | null;
  }> = [];

  try {
    const [pkgStats] = await db
      .select({
        total: sql<number>`count(*)`,
        approved: sql<number>`count(*) filter (where ${pkgFiles.status} = 'approved')`,
        pending: sql<number>`count(*) filter (where ${pkgFiles.status} = 'pending')`,
      })
      .from(pkgFiles)
      .where(and(eq(pkgFiles.uploaderId, userId), sql`${pkgFiles.deletedAt} IS NULL`));

    const [postStats] = await db
      .select({ total: sql<number>`count(*)` })
      .from(forumPosts)
      .where(and(eq(forumPosts.authorId, userId), sql`${forumPosts.deletedAt} IS NULL`));

    stats = {
      pkgsTotal: pkgStats?.total ?? 0,
      pkgsApproved: pkgStats?.approved ?? 0,
      pkgsPending: pkgStats?.pending ?? 0,
      forumPosts: postStats?.total ?? 0,
    };

    pkgs = await db
      .select({
        id: pkgFiles.id,
        title: pkgFiles.title,
        version: pkgFiles.version,
        sizeBytes: pkgFiles.sizeBytes,
        status: pkgFiles.status,
        downloadCount: pkgFiles.downloadCount,
        createdAt: pkgFiles.createdAt,
        gamePlatform: games.platform,
      })
      .from(pkgFiles)
      .leftJoin(games, eq(pkgFiles.gameId, games.id))
      .where(and(eq(pkgFiles.uploaderId, userId), sql`${pkgFiles.deletedAt} IS NULL`))
      .orderBy(desc(pkgFiles.createdAt))
      .limit(30);

    // Note: forumThreads join for thread title
    const { forumThreads } = await import("@/db/schema");
    posts = await db
      .select({
        id: forumPosts.id,
        bodyMd: forumPosts.bodyMd,
        score: forumPosts.score,
        createdAt: forumPosts.createdAt,
        threadTitle: forumThreads.title,
      })
      .from(forumPosts)
      .leftJoin(forumThreads, eq(forumPosts.threadId, forumThreads.id))
      .where(and(eq(forumPosts.authorId, userId), sql`${forumPosts.deletedAt} IS NULL`))
      .orderBy(desc(forumPosts.createdAt))
      .limit(30);
  } catch {
    // DB offline
  }

  const initials = userName.slice(0, 2).toUpperCase();
  const joined = session.user.createdAt
    ? new Date(session.user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  const serializedPkgs = pkgs.map((p) => ({
    ...p,
    sizeBytes: Number(p.sizeBytes),
    createdAt: p.createdAt.toISOString(),
  }));
  const serializedPosts = posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div
      className="animate-fade-in responsive-grid-2"
      style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 28 }}
    >
      {/* Profile card */}
      <GlassCard padding="24px" style={{ alignSelf: "start" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "1.5rem",
            color: "#fff",
            marginBottom: 14,
          }}
        >
          {initials}
        </div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
          {userName}
        </h2>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
            marginBottom: 16,
          }}
        >
          member since · {joined}
        </p>
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          <Tag variant="accent">{userRole}</Tag>
        </div>
        <SpecList
          items={[
            {
              label: "contributions",
              value: `${stats.pkgsApproved} ✓ · ${stats.pkgsPending} pending`,
            },
            { label: "forum posts", value: String(stats.forumPosts) },
            { label: "total pkgs", value: String(stats.pkgsTotal) },
          ]}
        />
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href="/settings"
            className="btn-secondary"
            style={{ flex: 1, textAlign: "center", textDecoration: "none" }}
          >
            Edit profile
          </a>
        </div>
      </GlassCard>

      {/* Content area */}
      <ProfileTabs pkgs={serializedPkgs} posts={serializedPosts} stats={stats} />
    </div>
  );
}
