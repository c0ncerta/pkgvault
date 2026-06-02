import { games, pkgFiles } from "@/db/schema";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { pkgSearchSchema, uploadRequestSchema } from "@/lib/validations/pkg";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/pkg — List/search PKG files
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const parsed = pkgSearchSchema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { q, page, limit, sort } = parsed.data;
  let { status } = parsed.data;
  const gameId = parsed.data.gameId;
  const platform = parsed.data.platform;
  const offset = (page - 1) * limit;

  // Build conditions
  const conditions = [];

  // Default to approved only for non-admin
  const session = await getServerSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role ?? "user";
  if (userRole !== "admin" && userRole !== "mod") {
    status = "approved";
  }

  if (status) {
    conditions.push(eq(pkgFiles.status, status));
  }

  // Soft-delete filter
  conditions.push(sql`${pkgFiles.deletedAt} IS NULL`);

  if (gameId) {
    conditions.push(eq(pkgFiles.gameId, gameId));
  }

  if (platform) {
    conditions.push(eq(games.platform, platform));
  }

  // Full-text search
  if (q) {
    conditions.push(
      sql`to_tsvector('english', ${pkgFiles.title} || ' ' || coalesce(${pkgFiles.description}, '')) @@ plainto_tsquery('english', ${q})`,
    );
  }

  // Sort
  const orderBy = {
    newest: desc(pkgFiles.createdAt),
    oldest: asc(pkgFiles.createdAt),
    downloads: desc(pkgFiles.downloadCount),
    title: asc(pkgFiles.title),
  }[sort];

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select({
        id: pkgFiles.id,
        title: pkgFiles.title,
        description: pkgFiles.description,
        sha256: pkgFiles.sha256,
        sizeBytes: pkgFiles.sizeBytes,
        version: pkgFiles.version,
        fwRequired: pkgFiles.fwRequired,
        status: pkgFiles.status,
        downloadCount: pkgFiles.downloadCount,
        createdAt: pkgFiles.createdAt,
        gameTitle: games.title,
        gamePlatform: games.platform,
        gameCoverUrl: games.coverUrl,
      })
      .from(pkgFiles)
      .leftJoin(games, eq(pkgFiles.gameId, games.id))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(pkgFiles).where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

/**
 * POST /api/pkg — Submit PKG metadata for moderation.
 *
 * The current production mode does not upload binaries to first-party storage.
 * Users submit metadata plus a SHA-256 checksum; moderators can attach external
 * sources later from the admin panel.
 * Requires authentication.
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

  const parsed = uploadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    title,
    description,
    gameId,
    platform,
    region,
    filename,
    contentType,
    sizeBytes,
    sha256,
    version,
    fwRequired,
  } = parsed.data;

  const [duplicate] = await db
    .select({ id: pkgFiles.id, title: pkgFiles.title })
    .from(pkgFiles)
    .where(eq(pkgFiles.sha256, sha256))
    .limit(1);

  if (duplicate) {
    return NextResponse.json(
      {
        duplicate: true,
        existingId: duplicate.id,
        existingTitle: duplicate.title,
        message: "This file already exists in the archive",
      },
      { status: 409 },
    );
  }

  let resolvedGameId = gameId ?? null;
  if (!resolvedGameId && platform) {
    const gameConditions = [eq(games.title, title), eq(games.platform, platform)];
    gameConditions.push(region ? eq(games.region, region) : isNull(games.region));

    const [existingGame] = await db
      .select({ id: games.id })
      .from(games)
      .where(and(...gameConditions))
      .limit(1);

    if (existingGame) {
      resolvedGameId = existingGame.id;
    } else {
      const [newGame] = await db
        .insert(games)
        .values({
          title,
          platform,
          region: region || null,
        })
        .returning({ id: games.id });
      resolvedGameId = newGame?.id ?? null;
    }
  }

  const [file] = await db
    .insert(pkgFiles)
    .values({
      uploaderId: session.user.id,
      gameId: resolvedGameId,
      title,
      description: description ?? null,
      sha256,
      sizeBytes: BigInt(sizeBytes),
      r2Key: null,
      contentType,
      originalFilename: filename,
      version: version ?? null,
      fwRequired: fwRequired ?? null,
      status: "pending",
    })
    .returning({ id: pkgFiles.id });

  if (!file) {
    return NextResponse.json({ error: "Failed to create PKG submission" }, { status: 500 });
  }

  return NextResponse.json({
    fileId: file.id,
    status: "pending",
    message: "PKG metadata submitted. Add a download source during moderation.",
  });
}
