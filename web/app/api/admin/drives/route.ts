import { driveAccounts } from "@/db/schema";
import { db } from "@/lib/db";
import { getGDriveAuthUrl, syncDriveQuota } from "@/lib/gdrive-oauth";
import { requireRole } from "@/lib/session";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const driveActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("connect") }).strict(),
  z.object({ action: z.literal("sync"), id: z.string().uuid() }).strict(),
  z.object({ action: z.literal("disconnect"), id: z.string().uuid() }).strict(),
  z.object({ action: z.literal("delete"), id: z.string().uuid() }).strict(),
  z
    .object({
      action: z.literal("update"),
      id: z.string().uuid(),
      label: z.string().max(200).optional(),
      notes: z.string().max(5000).optional(),
      isPrimary: z.boolean().optional(),
    })
    .strict(),
]);

export async function GET() {
  await requireRole("admin");

  const accounts = await db
    .select({
      id: driveAccounts.id,
      email: driveAccounts.email,
      label: driveAccounts.label,
      status: driveAccounts.status,
      quotaTotalBytes: driveAccounts.quotaTotalBytes,
      quotaUsedBytes: driveAccounts.quotaUsedBytes,
      quotaUsedInTrashBytes: driveAccounts.quotaUsedInTrashBytes,
      fileCount: driveAccounts.fileCount,
      folderCount: driveAccounts.folderCount,
      pkgFileCount: driveAccounts.pkgFileCount,
      pkgTotalBytes: driveAccounts.pkgTotalBytes,
      isPrimary: driveAccounts.isPrimary,
      lastSyncedAt: driveAccounts.lastSyncedAt,
      notes: driveAccounts.notes,
      createdAt: driveAccounts.createdAt,
    })
    .from(driveAccounts)
    .orderBy(driveAccounts.createdAt);

  return NextResponse.json({ accounts });
}

export async function POST(request: NextRequest) {
  await requireRole("admin");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = driveActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const action = data.action;

  if (action === "connect") {
    const url = getGDriveAuthUrl();
    return NextResponse.json({ url });
  }

  if (action === "sync") {
    const { id } = data;

    try {
      const quota = await syncDriveQuota(id);
      return NextResponse.json({
        ok: true,
        quota: {
          total: quota.total?.toString(),
          used: quota.used?.toString(),
          trash: quota.trash?.toString(),
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      await db
        .update(driveAccounts)
        .set({ status: "token_expired", updatedAt: new Date() })
        .where(eq(driveAccounts.id, id));
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  if (action === "disconnect") {
    const { id } = data;

    await db
      .update(driveAccounts)
      .set({
        status: "disconnected",
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(driveAccounts.id, id));

    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    const { id } = data;

    await db.delete(driveAccounts).where(eq(driveAccounts.id, id));
    return NextResponse.json({ ok: true });
  }

  if (action === "update") {
    const { id } = data;

    const updates: {
      updatedAt: Date;
      label?: string;
      notes?: string;
      isPrimary?: boolean;
    } = { updatedAt: new Date() };
    if (data.label !== undefined) updates.label = data.label;
    if (data.notes !== undefined) updates.notes = data.notes;
    if (data.isPrimary !== undefined) updates.isPrimary = data.isPrimary;

    await db.update(driveAccounts).set(updates).where(eq(driveAccounts.id, id));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
