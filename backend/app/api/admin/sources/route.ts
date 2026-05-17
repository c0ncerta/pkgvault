import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pkgSources, pkgFiles } from "@/db/schema";
import { getServerSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { z } from "zod";

const addSourceSchema = z.object({
  pkgId: z.string().uuid(),
  provider: z.enum(["r2", "direct", "gdrive", "mega", "mediafire", "archive_org", "torrent", "onedrive", "other"]),
  url: z.string().url().or(z.string().startsWith("magnet:")), // Allow magnet links
  label: z.string().max(200).optional(),
  isPrimary: z.boolean().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/admin/sources — List all sources (admin only)
 */
export async function GET() {
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "mod") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sources = await db
    .select({
      id: pkgSources.id,
      pkgId: pkgSources.pkgId,
      provider: pkgSources.provider,
      url: pkgSources.url,
      label: pkgSources.label,
      isPrimary: pkgSources.isPrimary,
      status: pkgSources.status,
      failCount: pkgSources.failCount,
      downloadCount: pkgSources.downloadCount,
      lastCheckedAt: pkgSources.lastCheckedAt,
      pkgTitle: pkgFiles.title,
    })
    .from(pkgSources)
    .leftJoin(pkgFiles, eq(pkgSources.pkgId, pkgFiles.id));

  return NextResponse.json({ data: sources });
}

/**
 * POST /api/admin/sources — Add a new source to a PKG
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "mod") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = addSourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { pkgId, provider, url, label, isPrimary, notes } = parsed.data;

  // Verify PKG exists
  const [pkg] = await db.select({ id: pkgFiles.id }).from(pkgFiles).where(eq(pkgFiles.id, pkgId)).limit(1);
  if (!pkg) {
    return NextResponse.json({ error: "PKG not found" }, { status: 404 });
  }

  // If marking as primary, unset other primaries
  if (isPrimary) {
    await db.update(pkgSources).set({ isPrimary: false }).where(eq(pkgSources.pkgId, pkgId));
  }

  const [source] = await db.insert(pkgSources).values({
    pkgId,
    provider,
    url,
    label: label ?? null,
    isPrimary: isPrimary ?? false,
    notes: notes ?? null,
    addedById: session!.user.id,
    status: "unknown",
  }).returning();

  return NextResponse.json({ source }, { status: 201 });
}
