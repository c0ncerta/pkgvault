import { pkgSources } from "@/db/schema";
import { db } from "@/lib/db";
import { checkSourceHealth } from "@/lib/health-check";
import { getServerSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/sources/[id]/check
 * Runs a single-source health check and persists the result.
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "mod") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const [source] = await db.select().from(pkgSources).where(eq(pkgSources.id, id)).limit(1);

  if (!source) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  await db.update(pkgSources).set({ status: "checking" }).where(eq(pkgSources.id, id));

  const result = await checkSourceHealth({
    provider: source.provider,
    url: source.url,
  });

  const now = new Date();
  await db
    .update(pkgSources)
    .set({
      status: result.alive ? "alive" : "dead",
      lastCheckedAt: now,
      lastAliveAt: result.alive ? now : source.lastAliveAt,
      failCount: result.alive ? 0 : source.failCount + 1,
      seederCount: result.seederCount,
      leecherCount: result.leecherCount,
      updatedAt: now,
    })
    .where(eq(pkgSources.id, id));

  return NextResponse.json({
    sourceId: id,
    alive: result.alive,
    seederCount: result.seederCount,
    leecherCount: result.leecherCount,
    reason: result.reason,
    checkedAt: now.toISOString(),
  });
}
