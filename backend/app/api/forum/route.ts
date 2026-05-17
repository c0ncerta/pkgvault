import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forumThreads, forumPosts, users } from "@/db/schema";
import { getServerSession } from "@/lib/session";
import { createThreadSchema, threadListSchema } from "@/lib/validations/forum";
import { rateLimit } from "@/lib/rate-limit";
import { eq, desc, asc, sql, and } from "drizzle-orm";
import { generateId } from "@/lib/utils";

/**
 * GET /api/forum — List forum threads
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const parsed = threadListSchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { category, page, limit, sort } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [sql`${forumThreads.deletedAt} IS NULL`];
  if (category) {
    conditions.push(eq(forumThreads.category, category));
  }

  const where = and(...conditions);

  // Sort: pinned threads always first, then by sort criteria
  const sortColumn = {
    newest: desc(forumThreads.createdAt),
    active: desc(forumThreads.lastPostAt),
    popular: desc(forumThreads.postCount),
  }[sort];

  const [data, countResult] = await Promise.all([
    db
      .select({
        id: forumThreads.id,
        title: forumThreads.title,
        category: forumThreads.category,
        isPinned: forumThreads.isPinned,
        isLocked: forumThreads.isLocked,
        postCount: forumThreads.postCount,
        lastPostAt: forumThreads.lastPostAt,
        createdAt: forumThreads.createdAt,
        authorName: users.name,
        authorImage: users.image,
      })
      .from(forumThreads)
      .leftJoin(users, eq(forumThreads.authorId, users.id))
      .where(where)
      .orderBy(desc(forumThreads.isPinned), sortColumn)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(forumThreads)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

/**
 * POST /api/forum — Create a new thread
 * Rate limited: 10 threads per hour per user
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const rl = await rateLimit(`rate:thread:${session.user.id}`, 10, 3600);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
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

  const parsed = createThreadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { title, category, bodyMd } = parsed.data;
  const threadId = generateId();
  const postId = generateId();
  const now = new Date();

  // Create thread + first post in a transaction-like sequence
  await db.insert(forumThreads).values({
    id: threadId,
    authorId: session.user.id,
    title,
    category,
    postCount: 1,
    lastPostAt: now,
  });

  await db.insert(forumPosts).values({
    id: postId,
    threadId,
    authorId: session.user.id,
    bodyMd,
    depth: 0,
  });

  return NextResponse.json(
    {
      threadId,
      postId,
      message: "Thread created successfully",
    },
    { status: 201 },
  );
}
