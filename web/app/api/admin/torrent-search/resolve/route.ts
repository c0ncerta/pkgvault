import http from "node:http";
import https from "node:https";
import { getServerSession } from "@/lib/session";
import { torrentBytesToMagnet } from "@/lib/torrent";
import { isSafeHttpUrl } from "@/lib/url-safety";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/torrent-search/resolve — Turn a Prowlarr download URL into a
 * magnet (admin/mod). Indexers like RuTracker redirect the download straight to
 * a `magnet:` link; others serve a `.torrent` file which we parse in memory.
 * Nothing is stored.
 */

interface FetchResult {
  status: number;
  location?: string;
  body?: Buffer;
}

// One-hop GET: returns the redirect Location (without following) or the body.
function getOnce(urlStr: string): Promise<FetchResult> {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const lib = u.protocol === "https:" ? https : http;
    const req = lib.get(u, (res) => {
      const status = res.statusCode ?? 0;
      if (status >= 300 && status < 400) {
        res.resume();
        resolve({ status, location: res.headers.location });
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve({ status, body: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    req.setTimeout(30_000, () => req.destroy(new Error("timeout")));
  });
}

export async function POST(request: NextRequest) {
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

  let body: { url?: string };
  try {
    body = (await request.json()) as { url?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = body.url ?? "";
  if (!raw.startsWith(base)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
  }

  let magnet: string;
  try {
    const u = new URL(raw);
    u.searchParams.set("apikey", key);
    const first = await getOnce(u.toString());

    if (first.status >= 300 && first.status < 400) {
      const loc = first.location ?? "";
      if (loc.startsWith("magnet:")) {
        magnet = loc;
      } else if (/^https?:/i.test(loc) && isSafeHttpUrl(loc)) {
        // Redirect to an actual .torrent file → fetch & convert.
        const second = await getOnce(loc);
        if (!second.body?.length) throw new Error(`download ${second.status}`);
        magnet = await torrentBytesToMagnet(new Uint8Array(second.body));
      } else {
        throw new Error("unexpected redirect target");
      }
    } else if (first.status === 200 && first.body?.length) {
      magnet = await torrentBytesToMagnet(new Uint8Array(first.body));
    } else {
      throw new Error(`download ${first.status}`);
    }
  } catch (e) {
    return NextResponse.json(
      { error: "Could not resolve torrent", detail: (e as Error).message },
      { status: 502 },
    );
  }

  return NextResponse.json({ magnet });
}
