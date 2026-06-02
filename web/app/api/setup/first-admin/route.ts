import { timingSafeEqual } from "node:crypto";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/** Constant-time string comparison to avoid leaking the token via timing. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * POST /api/setup/first-admin — Bootstrap the very first admin.
 *
 * Hardened:
 *   - Disabled unless `SETUP_TOKEN` is configured in the environment.
 *   - Caller must present the token via `Authorization: Bearer <SETUP_TOKEN>`
 *     or `x-setup-token` header (constant-time compared).
 *   - Only promotes when NO admin exists yet.
 *
 * Prefer the `db:create-admin` CLI script for normal operation; remove the
 * `SETUP_TOKEN` env var once the first admin is set to fully disable this route.
 */
export async function POST() {
  const setupToken = process.env["SETUP_TOKEN"];
  if (!setupToken) {
    // Route is intentionally disabled when no setup token is configured.
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const hdrs = await headers();
  const provided =
    (hdrs.get("authorization") ?? "").replace(/^Bearer\s+/i, "") || hdrs.get("x-setup-token") || "";
  if (!provided || !safeEqual(provided, setupToken)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await auth.api.getSession({ headers: hdrs });
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const existingAdmin = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  if (existingAdmin.length > 0) {
    return NextResponse.json({ error: "Admin already exists" }, { status: 400 });
  }

  await db.update(users).set({ role: "admin" }).where(eq(users.id, session.user.id));

  return NextResponse.json({ message: "You are now admin" });
}
