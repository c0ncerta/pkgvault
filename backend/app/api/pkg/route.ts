import { games, pkgFiles } from "@/db/schema";
import { db } from "@/lib/db";
import { R2_BUCKET, r2 } from "@/lib/r2";
import { getServerSession } from "@/lib/session";
import { generateId } from "@/lib/utils";
import { pkgSearchSchema, uploadRequestSchema } from "@/lib/validations/pkg";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, asc, desc, eq, sql } from "drizzle-orm";
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

  const { q, gameId, platform, status, page, limit, sort } = parsed.data;
  const offset = (page - 1) * limit;

  // Build conditions
  const conditions = [];

  // Default to approved only for non-admin
  const session = await getServerSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role ?? "user";
  if (status) {
    conditions.push(eq(pkgFiles.status, status));
  } else if (userRole !== "admin" && userRole !== "mod") {
    conditions.push(eq(pkgFiles.status, "approved"));
  }

  // Soft-delete filter
  conditions.push(sql`${pkgFiles.deletedAt} IS NULL`);

  if (gameId) {
    conditions.push(eq(pkgFiles.gameId, gameId));
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
 * POST /api/pkg — Request presigned upload URL
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

  const { title, description, gameId, filename, contentType, sizeBytes, version, fwRequired } =
    parsed.data;

  // Generate unique R2 key
  const fileId = generateId();
  const ext = filename.split(".").pop() ?? "pkg";
  const r2Key = `uploads/${fileId}.${ext}`;

  // Create presigned PUT URL (expires in 1 hour)
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
    ContentType: contentType,
    ContentLength: sizeBytes,
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

  // Insert pending record
  await db.insert(pkgFiles).values({
    id: fileId,
    uploaderId: session.user.id,
    gameId: gameId ?? null,
    title,
    description: description ?? null,
    sha256: "pending", // Will be updated on confirmation
    sizeBytes: BigInt(sizeBytes),
    r2Key,
    contentType,
    originalFilename: filename,
    version: version ?? null,
    fwRequired: fwRequired ?? null,
    status: "pending",
  });

  return NextResponse.json({
    fileId,
    uploadUrl,
    r2Key,
    expiresIn: 3600,
  });
}
