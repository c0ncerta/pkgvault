import { pkgSources } from "@/db/schema";
import { db } from "@/lib/db";
import { checkSourceHealth } from "@/lib/health-check";
import { requireRole } from "@/lib/session";
import { desc, inArray } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const checkSourcesSchema = z
  .object({
    ids: z.array(z.string().uuid()).max(200).optional(),
  })
  .strict();

type CheckResult = {
  sourceId: string;
  alive: boolean;
  status: "alive" | "dead";
  failCount: number;
  seederCount: number;
  leecherCount: number;
  reason?: string;
  checkedAt: string;
  lastCheckedAt: string;
};

/**
 * POST /api/admin/sources/check
 * Runs health checks for the selected admin source list.
 */
export async function POST(request: NextRequest) {
  await requireRole("mod");

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = checkSourcesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const ids = parsed.data.ids;
  if (ids && ids.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const sources = await db
    .select()
    .from(pkgSources)
    .where(ids ? inArray(pkgSources.id, ids) : undefined)
    .orderBy(desc(pkgSources.createdAt))
    .limit(200);

  if (sources.length === 0) {
    return NextResponse.json({ results: [] });
  }

  await db
    .update(pkgSources)
    .set({ status: "checking", updatedAt: new Date() })
    .where(
      inArray(
        pkgSources.id,
        sources.map((source) => source.id),
      ),
    );

  const results: CheckResult[] = [];
  let nextIndex = 0;
  const workerCount = Math.min(5, sources.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < sources.length) {
        const source = sources[nextIndex];
        nextIndex += 1;
        if (!source) continue;

        const result = await checkSourceHealth({
          provider: source.provider,
          url: source.url,
        });

        const now = new Date();
        const status = result.alive ? "alive" : "dead";
        const failCount = result.alive ? 0 : source.failCount + 1;

        await db
          .update(pkgSources)
          .set({
            status,
            lastCheckedAt: now,
            lastAliveAt: result.alive ? now : source.lastAliveAt,
            failCount,
            seederCount: result.seederCount,
            leecherCount: result.leecherCount,
            updatedAt: now,
          })
          .where(inArray(pkgSources.id, [source.id]));

        results.push({
          sourceId: source.id,
          alive: result.alive,
          status,
          failCount,
          seederCount: result.seederCount,
          leecherCount: result.leecherCount,
          reason: result.reason,
          checkedAt: now.toISOString(),
          lastCheckedAt: now.toISOString(),
        });
      }
    }),
  );

  return NextResponse.json({ results });
}
