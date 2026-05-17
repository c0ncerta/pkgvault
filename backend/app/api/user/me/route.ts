import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { pkgFiles, forumPosts } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";

/**
 * GET /api/user/me — Current user data with stats
 */
export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get contribution stats
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

  return NextResponse.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: (session.user as { role?: string }).role ?? "user",
    },
    stats: {
      pkgsTotal: pkgStats?.total ?? 0,
      pkgsApproved: pkgStats?.approved ?? 0,
      pkgsPending: pkgStats?.pending ?? 0,
      forumPosts: postStats?.total ?? 0,
    },
  });
}
