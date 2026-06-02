import { pkgSources } from "@/db/schema";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { isSafeExternalReference } from "@/lib/url-safety";
import { and, eq, ne } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const patchSourceSchema = z
  .object({
    url: z
      .string()
      .refine(isSafeExternalReference, "URL must be public http(s) or magnet")
      .optional(),
    label: z.string().max(200).nullable().optional(),
    isPrimary: z.boolean().optional(),
    status: z.enum(["alive", "dead", "unknown", "checking"]).optional(),
    notes: z.string().max(5000).nullable().optional(),
  })
  .strict();

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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchSourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updateData: Record<string, unknown> = {};
  const data = parsed.data;
  if (data.url !== undefined) updateData["url"] = data.url;
  if (data.label !== undefined) updateData["label"] = data.label;
  if (data.isPrimary !== undefined) updateData["isPrimary"] = data.isPrimary;
  if (data.status !== undefined) updateData["status"] = data.status;
  if (data.notes !== undefined) updateData["notes"] = data.notes;
  updateData["updatedAt"] = new Date();

  const [existing] = await db
    .select({ id: pkgSources.id, pkgId: pkgSources.pkgId })
    .from(pkgSources)
    .where(eq(pkgSources.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  if (data.isPrimary === true) {
    await db
      .update(pkgSources)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(and(eq(pkgSources.pkgId, existing.pkgId), ne(pkgSources.id, id)));
  }

  const [updated] = await db
    .update(pkgSources)
    .set(updateData)
    .where(eq(pkgSources.id, id))
    .returning();

  return NextResponse.json({ source: updated });
}
