import { getServerSession } from "@/lib/session";
import { isSafeHttpUrl } from "@/lib/url-safety";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/torrent-search/enrich — Pull a cover image from an indexer's
 * topic page (admin/mod). RuTracker pages embed cover art (imageban.ru etc.);
 * we fetch the page through FlareSolverr (which egresses via the VPN and solves
 * Cloudflare) and return the first usable image as a cover candidate.
 */
const FLARESOLVERR = process.env["FLARESOLVERR_URL"] ?? "http://gluetun:8191";

function extractCover(html: string): string | null {
  const imgs: string[] = [];
  // RuTracker lazy-loads images as <var class="postImg" title="URL">.
  for (const m of html.matchAll(/<var[^>]*class="postImg[^"]*"[^>]*title="([^"]+)"/g)) {
    if (m[1]) imgs.push(m[1]);
  }
  for (const m of html.matchAll(/<img[^>]+src="(https?:\/\/[^"]+\.(?:jpe?g|png|webp))"/gi)) {
    if (m[1]) imgs.push(m[1]);
  }
  // Skip avatars / forum chrome; the first real post image is the cover.
  const cover = imgs.find((u) => !/avatars|\/smiles?\/|sicon|static\.rutracker/i.test(u));
  return cover ?? null;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "mod") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { infoUrl?: string };
  try {
    body = (await request.json()) as { infoUrl?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const infoUrl = body.infoUrl ?? "";
  if (!infoUrl || !isSafeHttpUrl(infoUrl)) {
    return NextResponse.json({ error: "Invalid topic URL" }, { status: 400 });
  }

  try {
    const res = await fetch(`${FLARESOLVERR}/v1`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cmd: "request.get", url: infoUrl, maxTimeout: 60_000 }),
      signal: AbortSignal.timeout(75_000),
    });
    const data = (await res.json()) as { solution?: { response?: string } };
    const html = data.solution?.response ?? "";
    return NextResponse.json({ coverUrl: extractCover(html) });
  } catch (e) {
    return NextResponse.json(
      { error: "Could not fetch topic", detail: (e as Error).message },
      { status: 502 },
    );
  }
}
