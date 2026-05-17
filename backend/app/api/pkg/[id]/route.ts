import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pkgFiles, games, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/pkg/[id] — Get PKG file detail with metadata.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const [file] = await db
    .select({
      id: pkgFiles.id,
      title: pkgFiles.title,
      description: pkgFiles.description,
      sha256: pkgFiles.sha256,
      sizeBytes: pkgFiles.sizeBytes,
      r2Key: pkgFiles.r2Key,
      contentType: pkgFiles.contentType,
      originalFilename: pkgFiles.originalFilename,
      version: pkgFiles.version,
      fwRequired: pkgFiles.fwRequired,
      status: pkgFiles.status,
      downloadCount: pkgFiles.downloadCount,
      createdAt: pkgFiles.createdAt,
      updatedAt: pkgFiles.updatedAt,
      // Game info
      gameTitle: games.title,
      gameTitleId: games.titleId,
      gameRegion: games.region,
      gamePlatform: games.platform,
      gameCoverUrl: games.coverUrl,
      // Uploader info
      uploaderName: users.name,
      uploaderImage: users.image,
    })
    .from(pkgFiles)
    .leftJoin(games, eq(pkgFiles.gameId, games.id))
    .leftJoin(users, eq(pkgFiles.uploaderId, users.id))
    .where(eq(pkgFiles.id, id))
    .limit(1);

  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (file.status !== "approved") {
    // Only mods/admins can see non-approved files
    // (middleware handles this, but extra safety)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: file });
}

/**
 * PATCH /api/pkg/[id] — Update PKG status/metadata (admin/mod only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "mod") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.status !== undefined) updateData['status'] = body.status;
  if (body.title !== undefined) updateData['title'] = body.title;
  if (body.description !== undefined) updateData['description'] = body.description;
  if (body.version !== undefined) updateData['version'] = body.version;
  if (body.fwRequired !== undefined) updateData['fwRequired'] = body.fwRequired;
  updateData['updatedAt'] = new Date();

  const [updated] = await db
    .update(pkgFiles)
    .set(updateData)
    .where(eq(pkgFiles.id, id))
    .returning({ id: pkgFiles.id, status: pkgFiles.status });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}

