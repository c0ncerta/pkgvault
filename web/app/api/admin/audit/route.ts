import { auditLog } from "@/db/schema";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { desc } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/audit — View audit log (admin only)
 */
export async function GET(request: NextRequest) {
  await requireRole("admin");

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
  const offset = (page - 1) * limit;

  const data = await db.query.auditLog.findMany({
    with: {
      actor: {
        columns: { id: true, name: true, email: true },
      },
    },
    orderBy: [desc(auditLog.createdAt)],
    limit,
    offset,
  });

  return NextResponse.json({ data });
}
