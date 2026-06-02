import { games, pkgFiles, pkgSources, users } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { PkgManagerTable } from "./pkg-manager-table";
import type { PkgManagerRow } from "./pkg-manager-table";

export const metadata: Metadata = { title: "PKG Manager" };

export default async function PkgManagerPage() {
  let pkgs: Array<{
    id: string;
    title: string;
    status: string;
    sizeBytes: bigint;
    downloadCount: number;
    sha256: string;
    createdAt: Date;
    uploaderName: string | null;
    gamePlatform: string | null;
    sourceCount: number;
    aliveCount: number;
    deadCount: number;
  }> = [];

  try {
    const rows = await db
      .select({
        id: pkgFiles.id,
        title: pkgFiles.title,
        status: pkgFiles.status,
        sizeBytes: pkgFiles.sizeBytes,
        downloadCount: pkgFiles.downloadCount,
        sha256: pkgFiles.sha256,
        createdAt: pkgFiles.createdAt,
        uploaderName: users.name,
        gamePlatform: games.platform,
      })
      .from(pkgFiles)
      .leftJoin(users, eq(pkgFiles.uploaderId, users.id))
      .leftJoin(games, eq(pkgFiles.gameId, games.id))
      .where(sql`${pkgFiles.deletedAt} IS NULL`)
      .orderBy(desc(pkgFiles.createdAt))
      .limit(100);

    // Get source counts per PKG
    const sourceCountsRaw = await db
      .select({
        pkgId: pkgSources.pkgId,
        total: sql<number>`count(*)`,
        alive: sql<number>`count(*) filter (where ${pkgSources.status} = 'alive')`,
        dead: sql<number>`count(*) filter (where ${pkgSources.status} = 'dead')`,
      })
      .from(pkgSources)
      .groupBy(pkgSources.pkgId);

    const sourceCounts = new Map(sourceCountsRaw.map((r) => [r.pkgId, r]));

    pkgs = rows.map((r) => ({
      ...r,
      sourceCount: sourceCounts.get(r.id)?.total ?? 0,
      aliveCount: sourceCounts.get(r.id)?.alive ?? 0,
      deadCount: sourceCounts.get(r.id)?.dead ?? 0,
    }));
  } catch {
    // DB offline
  }

  return (
    <div className="animate-fade-in">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-24)",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "var(--fs-3xl)",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.03em",
            }}
          >
            PKG Manager
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--fs-md)" }}>
            {pkgs.length} packages — manage metadata, sources, and status
          </p>
        </div>
        <Link href="/admin/pkgs/new" className="btn-primary" style={{ fontSize: "var(--fs-md)" }}>
          + Add PKG
        </Link>
      </div>

      <PkgManagerTable
        pkgs={pkgs.map(
          (pkg): PkgManagerRow => ({
            ...pkg,
            sizeBytes: pkg.sizeBytes.toString(),
            createdAt: pkg.createdAt.toISOString(),
          }),
        )}
      />
    </div>
  );
}
