import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pkgFiles } from "@/db/schema";
import { getServerSession } from "@/lib/session";
import { uploadConfirmSchema } from "@/lib/validations/pkg";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/pkg/confirm — Confirm upload completed, provide SHA256.
 * Checks for duplicate SHA256 (dedup).
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
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = uploadConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { fileId, sha256 } = parsed.data;

  // Verify the file exists and belongs to the user
  const [file] = await db
    .select()
    .from(pkgFiles)
    .where(
      and(
        eq(pkgFiles.id, fileId),
        eq(pkgFiles.uploaderId, session.user.id),
      ),
    )
    .limit(1);

  if (!file) {
    return NextResponse.json(
      { error: "File not found or access denied" },
      { status: 404 },
    );
  }

  if (file.sha256 !== "pending") {
    return NextResponse.json(
      { error: "File already confirmed" },
      { status: 409 },
    );
  }

  // Check for SHA256 duplicate (dedup)
  const [existing] = await db
    .select({ id: pkgFiles.id, title: pkgFiles.title })
    .from(pkgFiles)
    .where(eq(pkgFiles.sha256, sha256))
    .limit(1);

  if (existing) {
    // Mark as duplicate — soft-delete the new upload
    await db
      .update(pkgFiles)
      .set({
        sha256,
        status: "rejected",
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pkgFiles.id, fileId));

    return NextResponse.json(
      {
        duplicate: true,
        existingId: existing.id,
        existingTitle: existing.title,
        message: "This file already exists in the archive",
      },
      { status: 409 },
    );
  }

  // Update SHA256 and keep status as pending (awaiting mod review)
  await db
    .update(pkgFiles)
    .set({
      sha256,
      updatedAt: new Date(),
    })
    .where(eq(pkgFiles.id, fileId));

  return NextResponse.json({
    fileId,
    sha256,
    status: "pending",
    message: "Upload confirmed. Awaiting moderator review.",
  });
}
