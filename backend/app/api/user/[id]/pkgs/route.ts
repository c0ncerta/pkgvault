import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pkgFiles, games } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

/**
 * GET /api/user/[id]/pkgs — PKGs uploaded by a user
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const data = await db
    .select({
      id: pkgFiles.id,
      title: pkgFiles.title,
      version: pkgFiles.version,
      sizeBytes: pkgFiles.sizeBytes,
      status: pkgFiles.status,
      downloadCount: pkgFiles.downloadCount,
      createdAt: pkgFiles.createdAt,
      gamePlatform: games.platform,
      gameRegion: games.region,
    })
    .from(pkgFiles)
    .leftJoin(games, eq(pkgFiles.gameId, games.id))
    .where(and(eq(pkgFiles.uploaderId, id), sql`${pkgFiles.deletedAt} IS NULL`))
    .orderBy(desc(pkgFiles.createdAt))
    .limit(50);

  return NextResponse.json({ data });
}
