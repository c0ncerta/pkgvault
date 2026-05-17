import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pkgFiles, pkgSources } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { r2, R2_BUCKET } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * POST /api/pkg/[id]/download — Get the best download URL for a PKG
 *
 * Priority:
 * 1. Primary alive source
 * 2. Any alive source (prefer R2 > direct > others)
 * 3. R2 presigned URL (legacy path)
 * 4. 404 if nothing available
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [pkg] = await db
    .select({
      r2Key: pkgFiles.r2Key,
      status: pkgFiles.status,
      originalFilename: pkgFiles.originalFilename,
      deletedAt: pkgFiles.deletedAt,
    })
    .from(pkgFiles)
    .where(eq(pkgFiles.id, id))
    .limit(1);

  if (!pkg || pkg.deletedAt !== null) {
    return NextResponse.json({ error: "PKG not found" }, { status: 404 });
  }

  if (pkg.status !== "approved") {
    return NextResponse.json({ error: "PKG not available for download" }, { status: 403 });
  }

  // Try to find the best source
  const sources = await db
    .select()
    .from(pkgSources)
    .where(and(
      eq(pkgSources.pkgId, id),
      sql`${pkgSources.status} != 'dead'`,
    ))
    .orderBy(
      desc(pkgSources.isPrimary),
      desc(sql`CASE ${pkgSources.provider}
        WHEN 'r2' THEN 5
        WHEN 'direct' THEN 4
        WHEN 'archive_org' THEN 3
        WHEN 'gdrive' THEN 2
        ELSE 1
      END`),
    );

  let downloadUrl: string | null = null;
  let sourceId: string | null = null;
  let provider: string = "unknown";

  const best = sources[0];
  if (best) {
    downloadUrl = best.url;
    sourceId = best.id;
    provider = best.provider;

    // For R2 sources, generate presigned URL
    if (best.provider === "r2" && pkg.r2Key) {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: pkg.r2Key,
        ResponseContentDisposition: `attachment; filename="${pkg.originalFilename ?? "download.pkg"}"`,
      });
      downloadUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });
    }

    // Increment source download counter
    await db
      .update(pkgSources)
      .set({ downloadCount: sql`${pkgSources.downloadCount} + 1` })
      .where(eq(pkgSources.id, best.id));
  } else if (pkg.r2Key) {
    // Legacy fallback: use R2 key directly
    provider = "r2";
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: pkg.r2Key,
      ResponseContentDisposition: `attachment; filename="${pkg.originalFilename ?? "download.pkg"}"`,
    });
    downloadUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });
  }

  if (!downloadUrl) {
    return NextResponse.json({
      error: "No download sources available",
      hint: "All download links for this PKG are currently down. Try again later.",
    }, { status: 503 });
  }

  // Increment PKG download counter
  await db
    .update(pkgFiles)
    .set({ downloadCount: sql`${pkgFiles.downloadCount} + 1` })
    .where(eq(pkgFiles.id, id));

  return NextResponse.json({
    downloadUrl,
    provider,
    sourceId,
    expiresIn: provider === "r2" ? 3600 : null,
  });
}
