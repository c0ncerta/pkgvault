import { getServerSession } from "@/lib/session";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/torrent-search?q=... — Search torrents via Prowlarr (admin/mod).
 *
 * Prowlarr fronts the configured indexers (e.g. RuTracker) and returns a unified
 * release list. Some indexers expose a magnet/infohash directly; others (like
 * RuTracker) only give a .torrent download link — for those we return the
 * Prowlarr download URL and resolve it to a magnet at "Add" time. Metadata only;
 * nothing is downloaded here. Nintendo titles are filtered out.
 */
const NINTENDO = /nintendo|\bswitch\b|\bnsp\b|\bxci\b|\bwii\b|\b3ds\b|\bnds\b|\beshop\b/i;

interface ProwlarrRelease {
  title?: string;
  infoHash?: string;
  magnetUrl?: string;
  downloadUrl?: string;
  seeders?: number;
  leechers?: number;
  size?: number;
  protocol?: string;
  indexer?: string;
  infoUrl?: string;
  guid?: string;
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

  // Rewrite a Prowlarr download URL to our in-network base and strip the API key
  // (it gets re-added server-side at resolve time).
  const rewriteDownload = (raw: string | undefined): string => {
    if (!raw) return "";
    try {
      const u = new URL(raw.replace(/^https?:\/\/[^/]+/, base));
      u.searchParams.delete("apikey");
      return u.toString();
    } catch {
      return "";
    }
  };

  const results = raw
    .filter((r) => (r.protocol ?? "torrent") === "torrent")
    .filter((r) => !NINTENDO.test(r.title ?? ""))
    .map((r) => {
      const name = r.title ?? "";
      let infoHash = (r.infoHash ?? "").toLowerCase();
      const magnet = r.magnetUrl ?? "";
      if (!infoHash && magnet) {
        infoHash = magnet.match(/btih:([a-z0-9]+)/i)?.[1]?.toLowerCase() ?? "";
      }
      return {
        name,
        infoHash,
        seeders: r.seeders ?? 0,
        leechers: r.leechers ?? 0,
        sizeBytes: r.size ?? 0,
        magnet, // may be empty (e.g. RuTracker) → resolved from downloadUrl on Add
        downloadUrl: rewriteDownload(r.downloadUrl),
        indexer: r.indexer ?? "",
        infoUrl: r.infoUrl ?? r.guid ?? "",
      };
    })
    .filter((r) => r.magnet || r.downloadUrl)
    .sort((a, b) => b.seeders - a.seeders)
    .slice(0, 50);

  return NextResponse.json({ results });
}
