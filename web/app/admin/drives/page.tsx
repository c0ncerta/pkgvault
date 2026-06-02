import { driveAccounts } from "@/db/schema";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import type { Metadata } from "next";
import { DrivesManager } from "./drives-manager";

export const metadata: Metadata = {
  title: "Google Drive Accounts — Admin",
};

export type DriveAccountRow = {
  id: string;
  email: string;
  label: string | null;
  status: "active" | "token_expired" | "disconnected" | "quota_exceeded";
  quotaTotalBytes: string | null;
  quotaUsedBytes: string | null;
  quotaUsedInTrashBytes: string | null;
  fileCount: number | null;
  folderCount: number | null;
  pkgFileCount: number;
  pkgTotalBytes: string;
  isPrimary: boolean;
  lastSyncedAt: string | null;
  notes: string | null;
  createdAt: string;
};

async function getDriveData() {
  try {
    const rows = await db.select().from(driveAccounts).orderBy(driveAccounts.createdAt);

    const accounts: DriveAccountRow[] = rows.map((r) => ({
      id: r.id,
      email: r.email,
      label: r.label,
      status: r.status,
      quotaTotalBytes: r.quotaTotalBytes?.toString() ?? null,
      quotaUsedBytes: r.quotaUsedBytes?.toString() ?? null,
      quotaUsedInTrashBytes: r.quotaUsedInTrashBytes?.toString() ?? null,
      fileCount: r.fileCount,
      folderCount: r.folderCount,
      pkgFileCount: r.pkgFileCount,
      pkgTotalBytes: r.pkgTotalBytes.toString(),
      isPrimary: r.isPrimary,
      lastSyncedAt: r.lastSyncedAt?.toISOString() ?? null,
      notes: r.notes,
      createdAt: r.createdAt.toISOString(),
    }));

    const [totals] = await db
      .select({
        totalQuota: sql<string>`coalesce(sum(${driveAccounts.quotaTotalBytes}), 0)`,
        totalUsed: sql<string>`coalesce(sum(${driveAccounts.quotaUsedBytes}), 0)`,
        activeCount: sql<number>`count(*) filter (where ${driveAccounts.status} = 'active')`,
        totalAccounts: sql<number>`count(*)`,
      })
      .from(driveAccounts);

    return {
      accounts,
      totals: {
        totalQuota: totals?.totalQuota ?? "0",
        totalUsed: totals?.totalUsed ?? "0",
        activeCount: totals?.activeCount ?? 0,
        totalAccounts: totals?.totalAccounts ?? 0,
      },
    };
  } catch {
    return {
      accounts: [],
      totals: { totalQuota: "0", totalUsed: "0", activeCount: 0, totalAccounts: 0 },
    };
  }
}

export default async function DrivesPage() {
  const { accounts, totals } = await getDriveData();

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: "var(--fs-4xl)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--color-text-primary)",
            marginBottom: 4,
          }}
        >
          Google Drive Accounts
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--fs-lg)" }}>
          Connect and monitor Google Drive accounts used for PKG file storage and backups.
        </p>
      </div>
      <DrivesManager accounts={accounts} totals={totals} />
    </div>
  );
}
