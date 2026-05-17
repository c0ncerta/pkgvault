import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pkgFiles } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, sql, and } from "drizzle-orm";

/**
 * GET /api/admin/queue — Moderation queue (pending PKG files)
 * Requires: mod or admin role
 */
export async function GET(request: NextRequest) {
  await requireRole("mod");

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  const [data, countResult] = await Promise.all([
    db.query.pkgFiles.findMany({
      where: and(
        eq(pkgFiles.status, "pending"),
        sql`${pkgFiles.deletedAt} IS NULL`,
        sql`${pkgFiles.sha256} != 'pending'`, // Only confirmed uploads
      ),
      with: {
        uploader: {
          columns: { id: true, name: true, email: true, image: true },
        },
        game: {
          columns: { id: true, title: true, platform: true },
        },
      },
      orderBy: (files, { asc }) => [asc(files.createdAt)],
      limit,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(pkgFiles)
      .where(
        and(
          eq(pkgFiles.status, "pending"),
          sql`${pkgFiles.deletedAt} IS NULL`,
          sql`${pkgFiles.sha256} != 'pending'`,
        ),
      ),
  ]);

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: countResult[0]?.count ?? 0,
    },
  });
}

/**
 * POST /api/admin/queue — Approve or reject a PKG file
 * Body: { fileId, action: "approve" | "reject", reason? }
 */
export async function POST(request: NextRequest) {
  const session = await requireRole("mod");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { fileId, action, reason } = body as {
    fileId: string;
    action: "approve" | "reject";
    reason?: string;
  };

  if (!fileId || !["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "fileId and action (approve|reject) required" },
      { status: 400 },
    );
  }

  const [file] = await db
    .select()
    .from(pkgFiles)
    .where(eq(pkgFiles.id, fileId))
    .limit(1);

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const newStatus = action === "approve" ? "approved" : "rejected";

  await db
    .update(pkgFiles)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(pkgFiles.id, fileId));

  // Log to audit (imported inline to avoid circular)
  const { auditLog } = await import("@/db/schema");
  await db.insert(auditLog).values({
    actorId: session.user.id,
    action: `pkg.${action}`,
    targetType: "pkg_file",
    targetId: fileId,
    metadata: { reason: reason ?? null, previousStatus: file.status },
  });

  return NextResponse.json({
    fileId,
    status: newStatus,
    message: `File ${action}d successfully`,
  });
}
