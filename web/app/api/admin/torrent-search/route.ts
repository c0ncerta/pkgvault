import { getServerSession } from "@/lib/session";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/torrent-search?q=... — Search torrents via Prowlarr (admin/mod).
 *
 * Prowlarr fronts the configured indexers (e.g. RuTracker) and returns a unified
 * release list. We normalise to a ready-to-store magnet. Metadata only — nothing
 * is downloaded. Nintendo titles are filtered out.
 */
const PUBLIC_TRACKERS = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://open.tracker.cl:1337/announce",
  "udp://tracker.openbittorrent.com:6969/announce",
];

const NINTENDO = /nintendo|\bswitch\b|\bnsp\b|\bxci\b|\bwii\b|\b3ds\b|\bnds\b|\beshop\b/i;

interface ProwlarrRelease {
  title?: string;
  infoHash?: string;
  magnetUrl?: string;
  seeders?: number;
  leechers?: number;
  size?: number;
  protocol?: string;
  indexer?: string;
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

  const base = process.env["PROWLARR_URL"];
  const key = process.env["PROWLARR_API_KEY"];
  if (!base || !key) {
    return NextResponse.json({ error: "Prowlarr is not configured" }, { status: 503 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 120) {
    return NextResponse.json({ error: "Query must be 2–120 chars" }, { status: 400 });
  }

  let raw: ProwlarrRelease[];
  try {
    const url = `${base}/api/v1/search?query=${encodeURIComponent(q)}&type=search&limit=100`;
    const res = await fetch(url, {
      headers: { "X-Api-Key": key },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`prowlarr ${res.status}`);
    raw = (await res.json()) as ProwlarrRelease[];
  } catch (e) {
    return NextResponse.json(
      { error: "Prowlarr unreachable", detail: (e as Error).message },
      { status: 502 },
    );
  }

  const results = raw
    .filter((r) => (r.protocol ?? "torrent") === "torrent")
    .filter((r) => !NINTENDO.test(r.title ?? ""))
    .map((r) => {
      const name = r.title ?? "";
      let infoHash = (r.infoHash ?? "").toLowerCase();
      let magnet = r.magnetUrl ?? "";
      if (!infoHash && magnet) {
        infoHash = magnet.match(/btih:([a-z0-9]+)/i)?.[1]?.toLowerCase() ?? "";
      }
      if (!magnet && infoHash) magnet = buildMagnet(infoHash, name);
      return {
        name,
        infoHash,
        seeders: r.seeders ?? 0,
        leechers: r.leechers ?? 0,
        sizeBytes: r.size ?? 0,
        magnet,
        indexer: r.indexer ?? "",
      };
    })
    .filter((r) => r.infoHash && r.magnet)
    .sort((a, b) => b.seeders - a.seeders)
    .slice(0, 50);

  return NextResponse.json({ results });
}
