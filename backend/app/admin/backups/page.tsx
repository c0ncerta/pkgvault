import { pkgFiles, pkgSources } from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq, isNull, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { BackupsManager } from "./backups-manager";

export const metadata: Metadata = {
  title: "GDrive Backups — Admin",
};

type Candidate = {
  id: string;
  title: string;
  version: string | null;
  sizeBytes: string;
  downloadCount: number;
  sha256: string;
  hasGdrive: boolean;
  torrentDead: boolean;
  gdriveUrl: string | null;
  magnetUrl: string | null;
};

async function getBackupOverview(): Promise<{
  totalApproved: number;
  withGdrive: number;
  withoutGdrive: number;
  torrentDead: number;
  candidates: Candidate[];
}> {
  try {
    const aggSub = db
      .select({
        pkgId: pkgSources.pkgId,
        totalTorrent: sql<number>`count(*) filter (where ${pkgSources.provider} = 'torrent')`.as(
          "total_torrent",
        ),
        aliveTorrent:
          sql<number>`count(*) filter (where ${pkgSources.provider} = 'torrent' and ${pkgSources.status} = 'alive' and ${pkgSources.seederCount} > 0)`.as(
            "alive_torrent",
          ),
        hasGdrive: sql<boolean>`bool_or(${pkgSources.provider} = 'gdrive')`.as("has_gdrive"),
        gdriveUrl: sql<
          string | null
        >`max(${pkgSources.url}) filter (where ${pkgSources.provider} = 'gdrive')`.as("gdrive_url"),
        magnetUrl: sql<
          string | null
        >`max(${pkgSources.url}) filter (where ${pkgSources.provider} = 'torrent')`.as(
          "magnet_url",
        ),
      })
      .from(pkgSources)
      .groupBy(pkgSources.pkgId)
      .as("agg");

    const rows = await db
      .select({
        id: pkgFiles.id,
        title: pkgFiles.title,
        version: pkgFiles.version,
        sizeBytes: pkgFiles.sizeBytes,
        downloadCount: pkgFiles.downloadCount,
        sha256: pkgFiles.sha256,
        hasGdrive: aggSub.hasGdrive,
        totalTorrent: aggSub.totalTorrent,
        aliveTorrent: aggSub.aliveTorrent,
        gdriveUrl: aggSub.gdriveUrl,
        magnetUrl: aggSub.magnetUrl,
      })
      .from(pkgFiles)
      .leftJoin(aggSub, eq(aggSub.pkgId, pkgFiles.id))
      .where(and(eq(pkgFiles.status, "approved"), isNull(pkgFiles.deletedAt)))
      .orderBy(sql`${pkgFiles.downloadCount} desc`);

    let withGdrive = 0;
    let torrentDead = 0;

    const candidates: Candidate[] = rows.map((r) => {
      const hasGdrive = r.hasGdrive ?? false;
      const tDead = (r.totalTorrent ?? 0) > 0 && (r.aliveTorrent ?? 0) === 0;
      if (hasGdrive) withGdrive++;
      if (tDead) torrentDead++;
      return {
        id: r.id,
        title: r.title,
        version: r.version,
        sizeBytes: String(r.sizeBytes),
        downloadCount: Number(r.downloadCount),
        sha256: r.sha256,
        hasGdrive,
        torrentDead: tDead,
        gdriveUrl: r.gdriveUrl,
        magnetUrl: r.magnetUrl,
      };
    });

    return {
      totalApproved: rows.length,
      withGdrive,
      withoutGdrive: rows.length - withGdrive,
      torrentDead,
      candidates,
    };
  } catch {
    return {
      totalApproved: 0,
      withGdrive: 0,
      withoutGdrive: 0,
      torrentDead: 0,
      candidates: [],
    };
  }
}

export default async function AdminBackupsPage() {
  const data = await getBackupOverview();

  return (
    <div className="animate-fade-in">
      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: 800,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.03em",
          marginBottom: 4,
        }}
      >
        GDrive Backups
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: "0.85rem",
          marginBottom: 32,
        }}
      >
        Manage Google Drive mirrors. Backup candidates appear when no GDrive mirror exists or
        torrent sources are dead.
      </p>

      <BackupsManager {...data} />
    </div>
  );
}
