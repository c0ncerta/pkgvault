import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  takedowns,
  pkgFiles,
  forumThreads,
  forumPosts,
  auditLog,
} from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const createTakedownSchema = z.object({
  targetType: z.enum(["pkg_file", "forum_thread", "forum_post", "user"]),
  targetId: z.string().uuid(),
  reason: z.string().min(1).max(2000),
});

/**
 * GET /api/admin/takedowns — List all takedowns
 */
export async function GET(request: NextRequest) {
  await requireRole("mod");

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  const data = await db.query.takedowns.findMany({
    with: {
      mod: {
        columns: { id: true, name: true },
      },
    },
    orderBy: [desc(takedowns.createdAt)],
    limit,
    offset,
  });

  return NextResponse.json({ data });
}

/**
 * POST /api/admin/takedowns — Create a takedown (soft-delete target)
 */
export async function POST(request: NextRequest) {
  const session = await requireRole("mod");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createTakedownSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { targetType, targetId, reason } = parsed.data;
  const now = new Date();

  // Soft-delete the target
  switch (targetType) {
    case "pkg_file":
      await db
        .update(pkgFiles)
        .set({ status: "taken_down", deletedAt: now, updatedAt: now })
        .where(eq(pkgFiles.id, targetId));
      break;
    case "forum_thread":
      await db
        .update(forumThreads)
        .set({ deletedAt: now, updatedAt: now })
        .where(eq(forumThreads.id, targetId));
      break;
    case "forum_post":
      await db
        .update(forumPosts)
        .set({ deletedAt: now, updatedAt: now })
        .where(eq(forumPosts.id, targetId));
      break;
    default:
      break;
  }

  // Create takedown record
  await db.insert(takedowns).values({
    targetType,
    targetId,
    reason,
    modId: session.user.id,
  });

  // Audit log
  await db.insert(auditLog).values({
    actorId: session.user.id,
    action: "takedown.create",
    targetType,
    targetId,
    metadata: { reason },
  });

  return NextResponse.json(
    { message: "Takedown applied", targetType, targetId },
    { status: 201 },
  );
}
