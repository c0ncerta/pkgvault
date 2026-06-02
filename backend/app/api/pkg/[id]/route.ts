import { games, pkgFiles, users } from "@/db/schema";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updatePkgSchema = z
  .object({
    status: z.enum(["pending", "approved", "rejected", "taken_down"]).optional(),
    title: z.string().min(1).max(500).optional(),
    description: z.string().max(5000).nullable().optional(),
    version: z.string().max(50).nullable().optional(),
    fwRequired: z.string().max(20).nullable().optional(),
    game: z
      .object({
        title: z.string().min(1).max(500).optional(),
        titleId: z.string().max(20).nullable().optional(),
        platform: z.string().max(20).nullable().optional(),
        region: z.string().max(10).nullable().optional(),
        coverUrl: z.union([z.string().url().max(2000), z.literal(""), z.null()]).optional(),
      })
      .optional(),
  })
  .strict();

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/pkg/[id] — Get PKG file detail with metadata.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  const [file] = await db
    .select({
      id: pkgFiles.id,
      title: pkgFiles.title,
      description: pkgFiles.description,
      sha256: pkgFiles.sha256,
      sizeBytes: pkgFiles.sizeBytes,
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

  if (file.status !== "approved" && role !== "admin" && role !== "mod") {
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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updatePkgSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updateData: Record<string, unknown> = {};
  const data = parsed.data;
  if (data.status !== undefined) updateData["status"] = data.status;
  if (data.title !== undefined) updateData["title"] = data.title;
  if (data.description !== undefined) updateData["description"] = data.description;
  if (data.version !== undefined) updateData["version"] = data.version;
  if (data.fwRequired !== undefined) updateData["fwRequired"] = data.fwRequired;
  updateData["updatedAt"] = new Date();

  const [file] = await db
    .select({ id: pkgFiles.id, gameId: pkgFiles.gameId })
    .from(pkgFiles)
    .where(eq(pkgFiles.id, id))
    .limit(1);

  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(pkgFiles)
    .set(updateData)
    .where(eq(pkgFiles.id, id))
    .returning({ id: pkgFiles.id, status: pkgFiles.status });

  if (data.game) {
    const gameData: Record<string, unknown> = {};
    if (data.game.title !== undefined) gameData["title"] = data.game.title;
    if (data.game.titleId !== undefined) gameData["titleId"] = data.game.titleId || null;
    if (data.game.platform !== undefined) gameData["platform"] = data.game.platform || null;
    if (data.game.region !== undefined) gameData["region"] = data.game.region || null;
    if (data.game.coverUrl !== undefined) gameData["coverUrl"] = data.game.coverUrl || null;

    if (Object.keys(gameData).length > 0) {
      gameData["updatedAt"] = new Date();

      if (file.gameId) {
        await db.update(games).set(gameData).where(eq(games.id, file.gameId));
      } else if (data.game.title && data.game.platform) {
        const [newGame] = await db
          .insert(games)
          .values({
            title: data.game.title,
            titleId: data.game.titleId || null,
            platform: data.game.platform,
            region: data.game.region || null,
            coverUrl: data.game.coverUrl || null,
          })
          .returning({ id: games.id });

        if (newGame) {
          await db.update(pkgFiles).set({ gameId: newGame.id }).where(eq(pkgFiles.id, id));
        }
      }
    }
  }

  return NextResponse.json({ data: updated });
}
