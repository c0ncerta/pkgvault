import { forumPosts, forumThreads, pkgFiles, votes } from "@/db/schema";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getServerSession } from "@/lib/session";
import { voteSchema } from "@/lib/validations/forum";
import { and, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/forum/vote — Cast/update/remove a vote
 * value: +1 (upvote), -1 (downvote), 0 (remove)
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 60 vote actions per minute per user (prevents score spamming).
  const rl = await rateLimit(`rate:vote:${session.user.id}`, 60, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter: rl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { targetType, targetId, value } = parsed.data;

  const targetExists = await verifyTargetExists(targetType, targetId);
  if (!targetExists) {
    return NextResponse.json({ error: "Vote target not found" }, { status: 404 });
  }

  // Check existing vote
  const [existing] = await db
    .select()
    .from(votes)
    .where(
      and(
        eq(votes.userId, session.user.id),
        eq(votes.targetType, targetType),
        eq(votes.targetId, targetId),
      ),
    )
    .limit(1);

  let scoreDelta = 0;

  // Apply the vote change and the target score update atomically so the
  // denormalized score can't drift from the votes table on partial failure.
  await db.transaction(async (tx) => {
    if (value === 0) {
      // Remove vote
      if (existing) {
        scoreDelta = -existing.value;
        await tx.delete(votes).where(eq(votes.id, existing.id));
      }
    } else if (existing) {
      // Update existing vote
      scoreDelta = value - existing.value;
      await tx.update(votes).set({ value }).where(eq(votes.id, existing.id));
    } else {
      // New vote
      scoreDelta = value;
      await tx.insert(votes).values({
        userId: session.user.id,
        targetType,
        targetId,
        value,
      });
    }

    // Update score on the target
    if (scoreDelta !== 0 && targetType === "post") {
      await tx
        .update(forumPosts)
        .set({ score: sql`${forumPosts.score} + ${scoreDelta}` })
        .where(eq(forumPosts.id, targetId));
    }
    // thread and pkg_file scores could be added similarly
  });

  return NextResponse.json({
    targetType,
    targetId,
    value: value === 0 ? null : value,
    scoreDelta,
  });
}

async function verifyTargetExists(targetType: "post" | "thread" | "pkg_file", targetId: string) {
  if (targetType === "post") {
    const [post] = await db
      .select({ id: forumPosts.id })
      .from(forumPosts)
      .where(and(eq(forumPosts.id, targetId), sql`${forumPosts.deletedAt} IS NULL`))
      .limit(1);
    return Boolean(post);
  }

  if (targetType === "thread") {
    const [thread] = await db
      .select({ id: forumThreads.id })
      .from(forumThreads)
      .where(and(eq(forumThreads.id, targetId), sql`${forumThreads.deletedAt} IS NULL`))
      .limit(1);
    return Boolean(thread);
  }

  const [pkg] = await db
    .select({ id: pkgFiles.id })
    .from(pkgFiles)
    .where(and(eq(pkgFiles.id, targetId), sql`${pkgFiles.deletedAt} IS NULL`))
    .limit(1);
  return Boolean(pkg);
}
