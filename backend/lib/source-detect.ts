export type SourceProvider =
  | "r2"
  | "direct"
  | "gdrive"
  | "mega"
  | "mediafire"
  | "archive_org"
  | "torrent"
  | "onedrive"
  | "other";

export function detectProvider(url: string): SourceProvider {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();

    if (host === "drive.google.com" || host === "drive.usercontent.google.com" || host === "docs.google.com") return "gdrive";
    if (host.includes("mega.") || host.includes("mega.nz")) return "mega";
    if (host.includes("mediafire")) return "mediafire";
    if (host.includes("archive.org")) return "archive_org";
    if (host.includes("onedrive") || host.includes("sharepoint")) return "onedrive";
    if (host.includes("r2.cloudflarestorage.com")) return "r2";
    if (url.startsWith("magnet:")) return "torrent";
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) return "direct";
    return "direct";
  } catch {
    return url.startsWith("magnet:") ? "torrent" : "other";
  }
}
