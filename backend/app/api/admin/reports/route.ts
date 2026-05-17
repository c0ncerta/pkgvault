import { auditLog, reports } from "@/db/schema";
import { db } from "@/lib/db";
import { getServerSession, requireRole } from "@/lib/session";
import { and, desc, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createReportSchema = z.object({
  targetType: z.enum(["pkg_file", "forum_thread", "forum_post", "user"]),
  targetId: z.string().uuid(),
  reason: z.string().min(1).max(2000),
});

const reviewReportSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum(["resolved", "dismissed"]),
  reviewNote: z.string().max(2000).optional(),
});

/**
 * GET /api/admin/reports — List reports (mod/admin only)
 */
export async function GET(request: NextRequest) {
  await requireRole("mod");

  const searchParams = request.nextUrl.searchParams;
  const statusFilter = searchParams.get("status") ?? "pending";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  const conditions = [];
  if (statusFilter !== "all") {
    conditions.push(
      eq(reports.status, statusFilter as "pending" | "reviewed" | "resolved" | "dismissed"),
    );
  }

  const data = await db.query.reports.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      reporter: {
        columns: { id: true, name: true },
      },
      reviewer: {
        columns: { id: true, name: true },
      },
    },
    orderBy: [desc(reports.createdAt)],
    limit,
    offset,
  });

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reports)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: countResult?.count ?? 0,
    },
  });
}

/**
 * POST /api/admin/reports — Submit a report (any authenticated user)
 * OR review a report (mod/admin with reviewReportSchema body)
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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // If body has "reportId", it's a review action (mod only)
  if ((body as Record<string, unknown>)['reportId']) {
    await requireRole("mod");

    const parsed = reviewReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { reportId, status, reviewNote } = parsed.data;

    await db
      .update(reports)
      .set({
        status,
        reviewedBy: session.user.id,
        reviewNote: reviewNote ?? null,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, reportId));

    await db.insert(auditLog).values({
      actorId: session.user.id,
      action: `report.${status}`,
      targetType: "report",
      targetId: reportId,
      metadata: { reviewNote },
    });

    return NextResponse.json({ reportId, status });
  }

  // Otherwise it's a new report from a user
  const parsed = createReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { targetType, targetId, reason } = parsed.data;

  await db.insert(reports).values({
    reporterId: session.user.id,
    targetType,
    targetId,
    reason,
  });

  return NextResponse.json({ message: "Report submitted. Thank you." }, { status: 201 });
}
