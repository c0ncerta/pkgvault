import { pkgFiles, pkgSources } from "@/db/schema";
import { db } from "@/lib/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/pkg/[id]/download — Resolve the best external download URL for a PKG.
 *
 * PKGVault is an index, not a host: every download points to a third-party
 * source. We just pick the best live one. Priority: primary source first, then
 * by provider quality.
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [pkg] = await db
    .select({
      status: pkgFiles.status,
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

  // Best non-dead source: primary first, then by provider quality.
  const sources = await db
    .select()
    .from(pkgSources)
    .where(and(eq(pkgSources.pkgId, id), sql`${pkgSources.status} != 'dead'`))
    .orderBy(
      desc(pkgSources.isPrimary),
      desc(sql`CASE ${pkgSources.provider}
        WHEN 'direct' THEN 4
        WHEN 'archive_org' THEN 3
        WHEN 'gdrive' THEN 2
        ELSE 1
      END`),
    );

  const best = sources[0];
  if (!best) {
    return NextResponse.json(
      {
        error: "No download sources available",
        hint: "All download links for this PKG are currently down. Try again later.",
      },
      { status: 503 },
    );
  }

  // Increment download counters (source + pkg).
  await db
    .update(pkgSources)
    .set({ downloadCount: sql`${pkgSources.downloadCount} + 1` })
    .where(eq(pkgSources.id, best.id));
  await db
    .update(pkgFiles)
    .set({ downloadCount: sql`${pkgFiles.downloadCount} + 1` })
    .where(eq(pkgFiles.id, id));

  return NextResponse.json({
    downloadUrl: best.url,
    provider: best.provider,
    sourceId: best.id,
    expiresIn: null,
  });
}
