import { type ClassValue, clsx } from "clsx";
import { uuidv7 } from "uuidv7";

/**
 * Generate a UUIDv7 — time-ordered, sortable, unique.
 * Used as default PK for all tables.
 */
export function generateId(): string {
  return uuidv7();
}

/**
 * Conditional class names (re-export for convenience).
 * Uses clsx under the hood — lighter than clsx+twMerge for server components.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Assert a value is defined (non-null, non-undefined).
 * Throws with a descriptive message in dev.
 */
export function assertDefined<T>(value: T | null | undefined, name = "value"): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`Expected ${name} to be defined, got ${String(value)}`);
  }
}

/**
 * Build a safe `Content-Disposition` value for a (possibly user-supplied) filename.
 *
 * Strips control chars and quotes/backslashes for the legacy `filename="..."` token,
 * and adds an RFC 5987 `filename*` token with the UTF-8 percent-encoded original so
 * unicode names survive. Prevents header injection via crafted filenames.
 */
export function contentDispositionAttachment(rawName: string | null | undefined): string {
  const fallback = "download.pkg";
  // Drop control chars (code point < 0x20 or 0x7f, incl. CR/LF) that could break the header.
  const cleaned = Array.from(rawName ?? "")
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code >= 0x20 && code !== 0x7f;
    })
    .join("")
    .trim();
  const name = cleaned || fallback;
  // Legacy token: ASCII printable only, no quotes/backslashes.
  const asciiSafe =
    Array.from(name)
      .map((ch) => {
        const code = ch.codePointAt(0) ?? 0;
        if (ch === '"' || ch === "\\") return "_";
        return code >= 0x20 && code <= 0x7e ? ch : "_";
      })
      .join("") || fallback;
  const encoded = encodeURIComponent(name);
  return `attachment; filename="${asciiSafe}"; filename*=UTF-8''${encoded}`;
}

/**
 * Sleep for the given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse a pagination cursor string into offset/limit.
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaults = { page: 1, limit: 20, maxLimit: 100 },
) {
  const page = Math.max(1, Number(searchParams.get("page")) || defaults.page);
  const limit = Math.min(
    defaults.maxLimit,
    Math.max(1, Number(searchParams.get("limit")) || defaults.limit),
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
