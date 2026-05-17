import { pkgSources } from "@/db/schema";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/admin/sources/[id] — Remove a source
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  await db.delete(pkgSources).where(eq(pkgSources.id, id));

  return NextResponse.json({ deleted: true });
}

/**
 * PATCH /api/admin/sources/[id] — Update a source
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "mod") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body["url"] !== undefined) updateData["url"] = body["url"];
  if (body["label"] !== undefined) updateData["label"] = body["label"];
  if (body["isPrimary"] !== undefined) updateData["isPrimary"] = body["isPrimary"];
  if (body["status"] !== undefined) updateData["status"] = body["status"];
  if (body["notes"] !== undefined) updateData["notes"] = body["notes"];
  updateData["updatedAt"] = new Date();

  const [updated] = await db
    .update(pkgSources)
    .set(updateData)
    .where(eq(pkgSources.id, id))
    .returning();

  return NextResponse.json({ source: updated });
}
