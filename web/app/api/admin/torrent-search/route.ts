import { getServerSession } from "@/lib/session";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/torrent-search?q=... — Search public torrent indexers (admin/mod).
 *
 * Queries apibay (The Pirate Bay's JSON API) and returns normalised results with
 * a ready-to-store magnet. We never download anything — this is metadata only,
 * the same way Prowlarr/Jackett work. Nintendo titles are filtered out.
 */
const PUBLIC_TRACKERS = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://open.tracker.cl:1337/announce",
  "udp://tracker.openbittorrent.com:6969/announce",
];

// Drop Nintendo content — out of scope and the highest-risk rightsholder.
const NINTENDO = /nintendo|\bswitch\b|\bnsp\b|\bxci\b|\bwii\b|\b3ds\b|\bnds\b|\beshop\b/i;

interface ApibayRow {
  id?: string;
  name?: string;
  info_hash?: string;
  seeders?: string;
  leechers?: string;
  size?: string;
}

function buildMagnet(infoHash: string, name: string): string {
  const trackers = PUBLIC_TRACKERS.map((t) => `&tr=${encodeURIComponent(t)}`).join("");
  return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(name)}${trackers}`;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "mod") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 120) {
    return NextResponse.json({ error: "Query must be 2–120 chars" }, { status: 400 });
  }

  let raw: ApibayRow[];
  try {
    const res = await fetch(`https://apibay.org/q.php?q=${encodeURIComponent(q)}&cat=0`, {
      headers: { "User-Agent": "PKGVault/1.0" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) throw new Error(`indexer ${res.status}`);
    raw = (await res.json()) as ApibayRow[];
  } catch (e) {
    return NextResponse.json(
      { error: "Torrent indexer unreachable", detail: (e as Error).message },
      { status: 502 },
    );
  }

  const results = raw
    // apibay sentinel for "nothing found" is a single row with id "0".
    .filter((r) => r.id !== "0" && !!r.info_hash && !/^0+$/.test(r.info_hash))
    .filter((r) => !NINTENDO.test(r.name ?? ""))
    .map((r) => {
      const name = r.name ?? "";
      const infoHash = (r.info_hash ?? "").toLowerCase();
      return {
        name,
        infoHash,
        seeders: Number.parseInt(r.seeders ?? "0", 10) || 0,
        leechers: Number.parseInt(r.leechers ?? "0", 10) || 0,
        sizeBytes: Number.parseInt(r.size ?? "0", 10) || 0,
        magnet: buildMagnet(infoHash, name),
      };
    })
    .sort((a, b) => b.seeders - a.seeders)
    .slice(0, 30);

  return NextResponse.json({ results });
}
