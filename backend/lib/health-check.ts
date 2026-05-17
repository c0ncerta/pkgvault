/**
 * Source health checking — provider-specific reachability + torrent scraping.
 *
 * Torrent scrape uses HTTP scrape protocol against public trackers + the trackers
 * embedded in the magnet URI. No native deps; uses fetch + manual bencode parse.
 */

const FETCH_TIMEOUT_MS = 10_000;

const PUBLIC_TRACKERS = [
  "https://tracker.opentrackr.org:443/announce",
  "https://tracker.gbitt.info:443/announce",
  "https://opentracker.i2p.rocks:443/announce",
];

export type HealthResult = {
  alive: boolean;
  seederCount: number;
  leecherCount: number;
  reason?: string;
};

export async function checkSourceHealth(source: {
  provider: string;
  url: string;
}): Promise<HealthResult> {
  try {
    switch (source.provider) {
      case "torrent":
        return await checkTorrent(source.url);
      case "gdrive":
        return await checkGDrive(source.url);
      case "mega":
        return await checkMega(source.url);
      case "archive_org":
        return await checkArchive(source.url);
      default:
        return await checkHttpHead(source.url);
    }
  } catch (e) {
    return { alive: false, seederCount: 0, leecherCount: 0, reason: (e as Error).message };
  }
}

// ─── Torrent scrape ─────────────────────────────────────────

async function checkTorrent(magnet: string): Promise<HealthResult> {
  if (!magnet.startsWith("magnet:")) {
    return { alive: false, seederCount: 0, leecherCount: 0, reason: "not a magnet URI" };
  }

  const infoHash = extractInfoHash(magnet);
  if (!infoHash) {
    return { alive: false, seederCount: 0, leecherCount: 0, reason: "no info_hash" };
  }

  const magnetTrackers = extractTrackers(magnet);
  const trackers = [...new Set([...magnetTrackers, ...PUBLIC_TRACKERS])].filter((t) =>
    t.startsWith("http"),
  );

  let bestSeeders = 0;
  let bestLeechers = 0;
  let anySuccess = false;

  await Promise.all(
    trackers.slice(0, 6).map(async (tracker) => {
      const result = await scrapeHttpTracker(tracker, infoHash);
      if (result) {
        anySuccess = true;
        if (result.seeders > bestSeeders) bestSeeders = result.seeders;
        if (result.leechers > bestLeechers) bestLeechers = result.leechers;
      }
    }),
  );

  return {
    alive: anySuccess && bestSeeders > 0,
    seederCount: bestSeeders,
    leecherCount: bestLeechers,
    reason: anySuccess ? undefined : "no tracker responded",
  };
}

function extractInfoHash(magnet: string): string | null {
  const match = magnet.match(/xt=urn:btih:([a-zA-Z0-9]+)/i);
  if (!match || !match[1]) return null;
  let hash = match[1];
  // Base32 → hex (40 chars). v1 hashes are 40 hex or 32 base32.
  if (hash.length === 32) hash = base32ToHex(hash);
  if (hash.length !== 40) return null;
  return hash.toLowerCase();
}

function extractTrackers(magnet: string): string[] {
  const trackers: string[] = [];
  const re = /tr=([^&]+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(magnet)) !== null) {
    if (match[1]) trackers.push(decodeURIComponent(match[1]));
  }
  return trackers;
}

function base32ToHex(b32: string): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of b32.toUpperCase()) {
    const idx = alphabet.indexOf(c);
    if (idx < 0) return "";
    bits += idx.toString(2).padStart(5, "0");
  }
  let hex = "";
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    hex += Number.parseInt(bits.slice(i, i + 8), 2)
      .toString(16)
      .padStart(2, "0");
  }
  return hex;
}

async function scrapeHttpTracker(
  announceUrl: string,
  infoHashHex: string,
): Promise<{ seeders: number; leechers: number } | null> {
  // Convert announce → scrape URL (replace last /announce with /scrape)
  const scrapeUrl = announceUrl.replace(/\/announce([^/]*)$/, "/scrape$1");
  if (scrapeUrl === announceUrl) return null;

  const infoHashBin = hexToBinaryUrl(infoHashHex);
  const url = `${scrapeUrl}?info_hash=${infoHashBin}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "PKGVault-HealthCheck/1.0" },
    });
    if (!res.ok) return null;

    const buf = new Uint8Array(await res.arrayBuffer());
    return parseScrapeResponse(buf);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function hexToBinaryUrl(hex: string): string {
  let out = "";
  for (let i = 0; i < hex.length; i += 2) {
    const byte = Number.parseInt(hex.slice(i, i + 2), 16);
    // URL-encode all bytes for safety
    out += `%${byte.toString(16).padStart(2, "0").toUpperCase()}`;
  }
  return out;
}

/**
 * Minimal bencode parser for tracker scrape responses.
 * Expected shape: d5:filesd20:<binary_infohash>d8:completei<n>e10:downloadedi<n>e10:incompletei<n>eeee
 */
function parseScrapeResponse(buf: Uint8Array): { seeders: number; leechers: number } | null {
  const text = bufToLatin1(buf);
  // Find first occurrence of "complete" + "incomplete"
  const completeMatch = text.match(/8:completei(\d+)e/);
  const incompleteMatch = text.match(/10:incompletei(\d+)e/);
  if (!completeMatch || !incompleteMatch) return null;
  const seeders = Number.parseInt(completeMatch[1] ?? "0", 10);
  const leechers = Number.parseInt(incompleteMatch[1] ?? "0", 10);
  if (Number.isNaN(seeders) || Number.isNaN(leechers)) return null;
  return { seeders, leechers };
}

function bufToLatin1(buf: Uint8Array): string {
  let s = "";
  for (let i = 0; i < buf.length; i++) s += String.fromCharCode(buf[i]!);
  return s;
}

// ─── HTTP/cloud checks ──────────────────────────────────────

async function checkHttpHead(url: string): Promise<HealthResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    return { alive: res.status < 400, seederCount: 0, leecherCount: 0 };
  } catch (e) {
    return { alive: false, seederCount: 0, leecherCount: 0, reason: (e as Error).message };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkGDrive(url: string): Promise<HealthResult> {
  const id = extractGDriveId(url);
  if (!id) return { alive: false, seederCount: 0, leecherCount: 0, reason: "no file id" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`https://drive.google.com/uc?export=download&id=${id}`, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal,
    });
    return { alive: res.status < 400, seederCount: 0, leecherCount: 0 };
  } catch (e) {
    return { alive: false, seederCount: 0, leecherCount: 0, reason: (e as Error).message };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkMega(url: string): Promise<HealthResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });
    const text = await res.text();
    const dead =
      text.includes("The file you are trying to download is no longer available") ||
      text.includes("File not available");
    return { alive: !dead && res.ok, seederCount: 0, leecherCount: 0 };
  } catch (e) {
    return { alive: false, seederCount: 0, leecherCount: 0, reason: (e as Error).message };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkArchive(url: string): Promise<HealthResult> {
  const id = extractArchiveId(url);
  if (!id) return { alive: false, seederCount: 0, leecherCount: 0, reason: "no archive id" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`https://archive.org/metadata/${id}`, {
      method: "HEAD",
      signal: controller.signal,
    });
    return { alive: res.status === 200, seederCount: 0, leecherCount: 0 };
  } catch (e) {
    return { alive: false, seederCount: 0, leecherCount: 0, reason: (e as Error).message };
  } finally {
    clearTimeout(timeout);
  }
}

function extractGDriveId(url: string): string | null {
  const m1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m1?.[1]) return m1[1];
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m2?.[1] ? m2[1] : null;
}

function extractArchiveId(url: string): string | null {
  const m1 = url.match(/archive\.org\/details\/([^/?]+)/);
  if (m1?.[1]) return m1[1];
  const m2 = url.match(/archive\.org\/download\/([^/?]+)/);
  return m2?.[1] ? m2[1] : null;
}
