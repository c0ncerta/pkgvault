import { games } from "@/db/schema";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { and, eq, ilike, isNotNull } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/pkgs/cover-suggest
 * Finds an existing local game cover by Title ID or title/platform.
 */
export async function GET(request: NextRequest) {
  await requireRole("mod");

  const title = request.nextUrl.searchParams.get("title")?.trim();
  const titleId = request.nextUrl.searchParams.get("titleId")?.trim();
  const platform = request.nextUrl.searchParams.get("platform")?.trim();

  if (titleId) {
    const [match] = await db
      .select({
        title: games.title,
        titleId: games.titleId,
        platform: games.platform,
        coverUrl: games.coverUrl,
      })
      .from(games)
      .where(and(isNotNull(games.coverUrl), eq(games.titleId, titleId)))
      .limit(1);

    if (match?.coverUrl) return NextResponse.json({ match });
  }

  if (title) {
    const [match] = await db
      .select({
        title: games.title,
        titleId: games.titleId,
        platform: games.platform,
        coverUrl: games.coverUrl,
      })
      .from(games)
      .where(
        and(
          isNotNull(games.coverUrl),
          ilike(games.title, `%${title}%`),
          platform ? eq(games.platform, platform) : undefined,
        ),
      )
      .limit(1);

    if (match?.coverUrl) return NextResponse.json({ match });
  }

  return NextResponse.json({ match: null });
}
