import { driveAccounts } from "@/db/schema";
import { db } from "@/lib/db";
import { getGDriveAuthUrl, syncDriveQuota } from "@/lib/gdrive-oauth";
import { requireRole } from "@/lib/session";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

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

  const body = await request.json();
  const action = body.action as string;

  if (action === "connect") {
    const url = getGDriveAuthUrl();
    return NextResponse.json({ url });
  }

  if (action === "sync") {
    const id = body.id as string;
    if (!id) return NextResponse.json({ error: "Missing account id" }, { status: 400 });

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
    const id = body.id as string;
    if (!id) return NextResponse.json({ error: "Missing account id" }, { status: 400 });

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
    const id = body.id as string;
    if (!id) return NextResponse.json({ error: "Missing account id" }, { status: 400 });

    await db.delete(driveAccounts).where(eq(driveAccounts.id, id));
    return NextResponse.json({ ok: true });
  }

  if (action === "update") {
    const id = body.id as string;
    if (!id) return NextResponse.json({ error: "Missing account id" }, { status: 400 });

    const updates: {
      updatedAt: Date;
      label?: string;
      notes?: string;
      isPrimary?: boolean;
    } = { updatedAt: new Date() };
    if (body.label !== undefined) updates.label = body.label;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.isPrimary !== undefined) updates.isPrimary = body.isPrimary;

    await db.update(driveAccounts).set(updates).where(eq(driveAccounts.id, id));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
