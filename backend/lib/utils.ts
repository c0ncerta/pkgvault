import { uuidv7 } from "uuidv7";
import { clsx, type ClassValue } from "clsx";

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
export function assertDefined<T>(
  value: T | null | undefined,
  name = "value",
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`Expected ${name} to be defined, got ${String(value)}`);
  }
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
