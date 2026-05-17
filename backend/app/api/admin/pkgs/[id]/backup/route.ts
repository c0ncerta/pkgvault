import { pkgFiles, pkgSources } from "@/db/schema";
import { db } from "@/lib/db";
import { normalizeGDrive, pingGDrive } from "@/lib/gdrive";
import { getServerSession } from "@/lib/session";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/pkgs/[id]/backup
 *
 * Registers a Google Drive backup mirror for a PKG.
 * Admin uploads the file to their 5TB Drive externally (or via the rclone
 * helper script on the ThinkPad), then posts the share URL here.
 *
 * Body: { gdriveUrl: string, label?: string, verify?: boolean }
 *
 * Effect:
 *   - Validates URL is a GDrive reference
 *   - If verify=true: HEAD-pings to confirm reachability before insert
 *   - Inserts pkg_sources row (provider=gdrive, isPrimary=false)
 *   - If a gdrive source already exists for this pkg, updates its URL instead
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "mod") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: pkgId } = await params;
  const body = (await request.json()) as {
    gdriveUrl?: string;
    label?: string;
    verify?: boolean;
  };

  if (!body.gdriveUrl) {
    return NextResponse.json({ error: "gdriveUrl required" }, { status: 400 });
  }

  const info = normalizeGDrive(body.gdriveUrl);
  if (!info) {
    return NextResponse.json({ error: "Not a recognizable Google Drive URL" }, { status: 400 });
  }

  const [pkg] = await db
    .select({ id: pkgFiles.id })
    .from(pkgFiles)
    .where(eq(pkgFiles.id, pkgId))
    .limit(1);
  if (!pkg) {
    return NextResponse.json({ error: "PKG not found" }, { status: 404 });
  }

  let alive = true;
  if (body.verify) {
    alive = await pingGDrive(info.shareUrl);
  }

  const now = new Date();
  const userId = (session?.user as { id: string }).id;

  // Upsert: if a gdrive source exists for this pkg, update it; else insert
  const [existing] = await db
    .select()
    .from(pkgSources)
    .where(and(eq(pkgSources.pkgId, pkgId), eq(pkgSources.provider, "gdrive")))
    .limit(1);

  if (existing) {
    await db
      .update(pkgSources)
      .set({
        url: info.shareUrl,
        label: body.label ?? existing.label ?? "GDrive backup",
        status: alive ? "alive" : "unknown",
        lastCheckedAt: body.verify ? now : existing.lastCheckedAt,
        lastAliveAt: alive && body.verify ? now : existing.lastAliveAt,
        failCount: alive ? 0 : existing.failCount,
        updatedAt: now,
      })
      .where(eq(pkgSources.id, existing.id));

    return NextResponse.json({
      sourceId: existing.id,
      action: "updated",
      alive,
      directUrl: info.directUrl,
    });
  }

  const [inserted] = await db
    .insert(pkgSources)
    .values({
      pkgId,
      provider: "gdrive",
      url: info.shareUrl,
      label: body.label ?? "GDrive backup",
      isPrimary: false,
      status: alive ? "alive" : "unknown",
      lastCheckedAt: body.verify ? now : null,
      lastAliveAt: alive && body.verify ? now : null,
      addedById: userId,
    })
    .returning({ id: pkgSources.id });

  return NextResponse.json({
    sourceId: inserted?.id,
    action: "created",
    alive,
    directUrl: info.directUrl,
  });
}

/**
 * DELETE /api/admin/pkgs/[id]/backup
 * Removes the GDrive backup mirror for a pkg.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "mod") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: pkgId } = await params;
  const deleted = await db
    .delete(pkgSources)
    .where(and(eq(pkgSources.pkgId, pkgId), eq(pkgSources.provider, "gdrive")))
    .returning({ id: pkgSources.id });

  return NextResponse.json({ removed: deleted.length });
}
