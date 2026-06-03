/**
 * Minimal .torrent → magnet converter (no dependencies).
 *
 * A magnet's infohash is the SHA-1 of the bencoded `info` dictionary's raw bytes.
 * We locate that exact byte slice in the file and hash it with Web Crypto
 * (available in both browsers and Node 18+). Nothing is uploaded or stored —
 * conversion happens entirely client-side.
 */

const DIGIT_0 = 0x30;
const DIGIT_9 = 0x39;
const CHAR_i = 0x69; // 'i'
const CHAR_l = 0x6c; // 'l'
const CHAR_d = 0x64; // 'd'
const CHAR_e = 0x65; // 'e'
const CHAR_colon = 0x3a; // ':'

function isDigit(b: number | undefined): boolean {
  return b !== undefined && b >= DIGIT_0 && b <= DIGIT_9;
}

/** Read a bencoded string length prefix starting at p; returns [len, offsetAfterColon]. */
function readLen(buf: Uint8Array, p: number): [number, number] {
  let e = p;
  let len = 0;
  while (isDigit(buf[e])) {
    len = len * 10 + ((buf[e] as number) - DIGIT_0);
    e++;
  }
  if (buf[e] !== CHAR_colon) throw new Error("malformed bencode string");
  return [len, e + 1];
}

/** Return the [start, end) byte offsets of the value for a top-level dict key. */
function findTopLevelValue(
  buf: Uint8Array,
  wantKey: string,
): { start: number; end: number } | null {
  if (buf[0] !== CHAR_d) return null; // must be a dict
  const decoder = new TextDecoder();

  // Skip any bencoded element starting at p; return the offset just past it.
  function skip(p: number): number {
    const c = buf[p];
    if (c === CHAR_i) {
      let e = p + 1;
      while (buf[e] !== CHAR_e) e++;
      return e + 1;
    }
    if (c === CHAR_l || c === CHAR_d) {
      let e = p + 1;
      while (buf[e] !== CHAR_e) e = skip(e);
      return e + 1;
    }
    const [len, after] = readLen(buf, p);
    return after + len;
  }

  let pos = 1;
  while (pos < buf.length && buf[pos] !== CHAR_e) {
    const [len, after] = readLen(buf, pos);
    const key = decoder.decode(buf.slice(after, after + len));
    const valStart = after + len;
    const valEnd = skip(valStart);
    if (key === wantKey) return { start: valStart, end: valEnd };
    pos = valEnd;
  }
  return null;
}

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Parse a .torrent and return its magnet URI (infohash + name). */
export async function torrentBytesToMagnet(buf: Uint8Array): Promise<string> {
  const info = findTopLevelValue(buf, "info");
  if (!info) throw new Error("Not a valid .torrent file (no info dictionary)");

  const infoBytes = buf.slice(info.start, info.end);
  const digest = await crypto.subtle.digest("SHA-1", infoBytes);
  const infoHash = toHex(digest);

  // Best-effort display name from info.name (optional).
  let dn = "";
  try {
    const name = findTopLevelValue(infoBytes, "name");
    if (name) {
      const [len, after] = readLen(infoBytes, name.start);
      dn = new TextDecoder().decode(infoBytes.slice(after, after + len));
    }
  } catch {
    // name is optional; ignore
  }

  return dn
    ? `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(dn)}`
    : `magnet:?xt=urn:btih:${infoHash}`;
}

export async function torrentFileToMagnet(file: File): Promise<string> {
  return torrentBytesToMagnet(new Uint8Array(await file.arrayBuffer()));
}
