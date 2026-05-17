/**
 * Google Drive helpers — URL normalization, file id extraction,
 * direct-download URL construction.
 *
 * The DB stores the share URL (any form). At download time we resolve to a
 * direct-download URL so the user gets the file with a single hop.
 */

export type GDriveUrlInfo = {
  fileId: string;
  shareUrl: string;       // canonical /file/d/<id>/view share URL
  directUrl: string;      // single-hop direct download URL
};

const GDRIVE_HOSTS = new Set([
  "drive.google.com",
  "drive.usercontent.google.com",
  "docs.google.com",
]);

/**
 * Extracts a GDrive file id from any common URL form, or returns the input
 * if it's already a bare id.
 */
export function extractGDriveId(input: string): string | null {
  if (!input) return null;

  // Bare id heuristic: 25–60 chars of url-safe base64
  if (/^[a-zA-Z0-9_-]{25,60}$/.test(input)) return input;

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }

  if (!GDRIVE_HOSTS.has(url.host)) return null;

  // /file/d/<id>/...
  const m1 = url.pathname.match(/\/(?:file|folders|d)\/([a-zA-Z0-9_-]{20,})/);
  if (m1 && m1[1]) return m1[1];

  // ?id=<id>
  const idParam = url.searchParams.get("id");
  if (idParam && /^[a-zA-Z0-9_-]{20,}$/.test(idParam)) return idParam;

  return null;
}

/**
 * Normalizes a GDrive URL/id into share + direct download forms.
 * Returns null if input is not a recognisable GDrive reference.
 */
export function normalizeGDrive(input: string): GDriveUrlInfo | null {
  const fileId = extractGDriveId(input);
  if (!fileId) return null;
  return {
    fileId,
    shareUrl: `https://drive.google.com/file/d/${fileId}/view`,
    directUrl: `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
  };
}

/**
 * Lightweight reachability check for a GDrive file. Returns whether the file
 * appears accessible (public or anyone-with-link). Does not verify content.
 */
export async function pingGDrive(input: string, timeoutMs = 10_000): Promise<boolean> {
  const info = normalizeGDrive(input);
  if (!info) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(info.directUrl, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal,
    });
    return res.status < 400 || res.status === 302 || res.status === 303;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
