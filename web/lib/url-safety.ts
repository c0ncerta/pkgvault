const BLOCKED_HOSTS = new Set(["localhost", "localhost.localdomain"]);

function parseIpv4(hostname: string): number[] | null {
  const parts = hostname.split(".");
  if (parts.length !== 4) return null;

  const bytes = parts.map((part) => {
    if (!/^\d{1,3}$/.test(part)) return Number.NaN;
    const value = Number(part);
    return value >= 0 && value <= 255 ? value : Number.NaN;
  });

  return bytes.some(Number.isNaN) ? null : bytes;
}

function isBlockedIpv4(hostname: string): boolean {
  const ip = parseIpv4(hostname);
  if (!ip) return false;

  const [a = 0, b = 0] = ip;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isBlockedIpv6(hostname: string): boolean {
  const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("ff")
  );
}

export function isSafeHttpUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (url.username || url.password) return false;

    const hostname = url.hostname.toLowerCase();
    if (!hostname || BLOCKED_HOSTS.has(hostname) || hostname.endsWith(".localhost")) return false;
    if (isBlockedIpv4(hostname) || isBlockedIpv6(hostname)) return false;

    return true;
  } catch {
    return false;
  }
}

export function isSafeExternalReference(rawUrl: string): boolean {
  return rawUrl.startsWith("magnet:") || isSafeHttpUrl(rawUrl);
}

export function requireSafeHttpUrl(rawUrl: string): URL {
  if (!isSafeHttpUrl(rawUrl)) {
    throw new Error("URL is not allowed for server-side fetching");
  }

  return new URL(rawUrl);
}
