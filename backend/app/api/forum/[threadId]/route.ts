import { forumPosts, forumThreads, users } from "@/db/schema";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getServerSession } from "@/lib/session";
import { generateId } from "@/lib/utils";
import { createPostSchema } from "@/lib/validations/forum";
import { and, asc, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ threadId: string }>;
}

/**
 * GET /api/forum/[threadId] — Get thread + posts (nested)
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { threadId } = await params;

  // Get thread info
  const [thread] = await db
    .select({
      id: forumThreads.id,
      title: forumThreads.title,
      category: forumThreads.category,
      isPinned: forumThreads.isPinned,
      isLocked: forumThreads.isLocked,
      postCount: forumThreads.postCount,
      createdAt: forumThreads.createdAt,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(forumThreads)
    .leftJoin(users, eq(forumThreads.authorId, users.id))
    .where(and(eq(forumThreads.id, threadId), sql`${forumThreads.deletedAt} IS NULL`))
    .limit(1);

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  // Get all posts for the thread (flat, frontend builds the tree)
  const posts = await db
    .select({
      id: forumPosts.id,
      parentId: forumPosts.parentId,
      bodyMd: forumPosts.bodyMd,
      bodyHtml: forumPosts.bodyHtml,
      score: forumPosts.score,
      depth: forumPosts.depth,
      isEdited: forumPosts.isEdited,
      createdAt: forumPosts.createdAt,
      authorName: users.name,
      authorImage: users.image,
      authorId: forumPosts.authorId,
    })
    .from(forumPosts)
    .leftJoin(users, eq(forumPosts.authorId, users.id))
    .where(and(eq(forumPosts.threadId, threadId), sql`${forumPosts.deletedAt} IS NULL`))
    .orderBy(asc(forumPosts.createdAt));

  return NextResponse.json({ thread, posts });
}

/**
 * POST /api/forum/[threadId] — Reply to a thread
 * Rate limited: 1 post per minute per user
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { threadId } = await params;

  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify thread exists and is not locked
  const [thread] = await db
    .select({
      id: forumThreads.id,
      isLocked: forumThreads.isLocked,
    })
    .from(forumThreads)
    .where(and(eq(forumThreads.id, threadId), sql`${forumThreads.deletedAt} IS NULL`))
    .limit(1);

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  if (thread.isLocked) {
    return NextResponse.json({ error: "Thread is locked" }, { status: 403 });
  }

  // Rate limit
  const rl = await rateLimit(`rate:post:${session.user.id}`, 1, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Wait before posting again.",
        retryAfter: rl.retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Override threadId from URL
  const parsed = createPostSchema.safeParse({
    ...(body as object),
    threadId,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { parentId, bodyMd } = parsed.data;

  // Calculate depth from parent
  let depth = 0;
  if (parentId) {
    const [parent] = await db
      .select({ depth: forumPosts.depth })
      .from(forumPosts)
      .where(
        and(
          eq(forumPosts.id, parentId),
          eq(forumPosts.threadId, threadId),
          sql`${forumPosts.deletedAt} IS NULL`,
        ),
      )
      .limit(1);

    if (!parent) {
      return NextResponse.json({ error: "Parent post not found in this thread" }, { status: 404 });
    }
    depth = Math.min((parent.depth ?? 0) + 1, 3); // Max depth 3
  }

  const postId = generateId();
  const now = new Date();

  await db.insert(forumPosts).values({
    id: postId,
    threadId,
    authorId: session.user.id,
    parentId: parentId ?? null,
    bodyMd,
    depth,
  });

  // Update thread post count and last activity
  await db
    .update(forumThreads)
    .set({
      postCount: sql`${forumThreads.postCount} + 1`,
      lastPostAt: now,
      updatedAt: now,
    })
    .where(eq(forumThreads.id, threadId));

  return NextResponse.json(
    {
      postId,
      threadId,
      depth,
      message: "Reply posted successfully",
    },
    { status: 201 },
  );
}
