import { games, pkgFiles, pkgSources } from "@/db/schema";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { isSafeExternalReference } from "@/lib/url-safety";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createPkgSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).nullable().optional(),
  sha256: z
    .string()
    .length(64)
    .regex(/^[a-f0-9]+$/),
  sizeBytes: z.number().int().min(0),
  version: z.string().max(50).nullable().optional(),
  fwRequired: z.string().max(20).nullable().optional(),
  game: z.object({
    title: z.string().min(1),
    titleId: z.string().max(20).nullable().optional(),
    platform: z.string().max(20),
    region: z.string().max(10).optional(),
  }),
  sources: z
    .array(
      z.object({
        url: z.string().refine(isSafeExternalReference, "URL must be public http(s) or magnet"),
        provider: z.enum([
          "r2",
          "direct",
          "gdrive",
          "mega",
          "mediafire",
          "archive_org",
          "torrent",
          "onedrive",
          "other",
        ]),
        label: z.string().max(200).nullable().optional(),
        isPrimary: z.boolean().optional(),
      }),
    )
    .optional(),
});

/**
 * POST /api/admin/pkgs — Create a new PKG entry (admin only)
 * Creates game record if needed, creates PKG, and adds sources.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createPkgSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { title, description, sha256, sizeBytes, version, fwRequired, game, sources } = parsed.data;

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

  // Create game (if needed) + PKG + sources atomically.
  let pkgId: string;
  try {
    pkgId = await db.transaction(async (tx) => {
      // Find or create game
      let gameId: string;
      if (game.titleId) {
        const [existing] = await tx
          .select({ id: games.id })
          .from(games)
          .where(eq(games.titleId, game.titleId))
          .limit(1);

        if (existing) {
          gameId = existing.id;
        } else {
          const [newGame] = await tx
            .insert(games)
            .values({
              title: game.title,
              titleId: game.titleId ?? null,
              platform: game.platform,
              region: game.region ?? null,
            })
            .returning({ id: games.id });
          if (!newGame) throw new Error("Failed to create game");
          gameId = newGame.id;
        }
      } else {
        const [newGame] = await tx
          .insert(games)
          .values({
            title: game.title,
            platform: game.platform,
            region: game.region ?? null,
          })
          .returning({ id: games.id });
        if (!newGame) throw new Error("Failed to create game");
        gameId = newGame.id;
      }

      // Create PKG entry
      const [pkg] = await tx
        .insert(pkgFiles)
        .values({
          uploaderId: session?.user.id,
          gameId,
          title,
          description: description ?? null,
          sha256,
          sizeBytes: BigInt(sizeBytes),
          r2Key: null, // No R2 for admin-created entries
          version: version ?? null,
          fwRequired: fwRequired ?? null,
          status: "approved", // Admin-created = auto-approved
        })
        .returning({ id: pkgFiles.id });

      if (!pkg) throw new Error("Failed to create pkg");

      // Add sources
      if (sources && sources.length > 0) {
        await tx.insert(pkgSources).values(
          sources.map((s) => ({
            pkgId: pkg.id,
            provider: s.provider,
            url: s.url,
            label: s.label ?? null,
            isPrimary: s.isPrimary ?? false,
            status: "unknown" as const,
            addedById: session?.user.id,
          })),
        );
      }

      return pkg.id;
    });
  } catch {
    return NextResponse.json({ error: "Failed to create PKG entry" }, { status: 500 });
  }

  return NextResponse.json({ pkgId }, { status: 201 });
}
