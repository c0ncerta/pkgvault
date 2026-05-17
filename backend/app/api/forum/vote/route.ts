import { forumPosts, votes } from "@/db/schema";
import { db } from "@/lib/db";
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

  if (value === 0) {
    // Remove vote
    if (existing) {
      scoreDelta = -existing.value;
      await db.delete(votes).where(eq(votes.id, existing.id));
    }
  } else if (existing) {
    // Update existing vote
    scoreDelta = value - existing.value;
    await db.update(votes).set({ value }).where(eq(votes.id, existing.id));
  } else {
    // New vote
    scoreDelta = value;
    await db.insert(votes).values({
      userId: session.user.id,
      targetType,
      targetId,
      value,
    });
  }

  // Update score on the target
  if (scoreDelta !== 0) {
    if (targetType === "post") {
      await db
        .update(forumPosts)
        .set({ score: sql`${forumPosts.score} + ${scoreDelta}` })
        .where(eq(forumPosts.id, targetId));
    }
    // thread and pkg_file scores could be added similarly
  }

  return NextResponse.json({
    targetType,
    targetId,
    value: value === 0 ? null : value,
    scoreDelta,
  });
}
