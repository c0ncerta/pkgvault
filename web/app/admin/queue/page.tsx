import { GlassCard } from "@/components/liquid/glass";
import { IconCatalog, IconSettings, IconUser } from "@/components/ui/icons";
import { games, pkgFiles, users } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { QueueActions } from "./queue-actions";

export const metadata: Metadata = { title: "Mod Queue" };

function formatBytes(bytes: bigint | number): string {
  const num = Number(bytes);
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)} GB`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)} MB`;
  return `${(num / 1e3).toFixed(0)} KB`;
}

export default async function QueuePage() {
  let pendingPkgs: {
    id: string;
    title: string;
    description: string | null;
    sha256: string;
    sizeBytes: bigint;
    version: string | null;
    fwRequired: string | null;
    createdAt: Date;
    uploaderName: string | null;
    gamePlatform: string | null;
    gameTitle: string | null;
  }[] = [];

  try {
    pendingPkgs = await db
      .select({
        id: pkgFiles.id,
        title: pkgFiles.title,
        description: pkgFiles.description,
        sha256: pkgFiles.sha256,
        sizeBytes: pkgFiles.sizeBytes,
        version: pkgFiles.version,
        fwRequired: pkgFiles.fwRequired,
        createdAt: pkgFiles.createdAt,
        uploaderName: users.name,
        gamePlatform: games.platform,
        gameTitle: games.title,
      })
      .from(pkgFiles)
      .leftJoin(users, eq(pkgFiles.uploaderId, users.id))
      .leftJoin(games, eq(pkgFiles.gameId, games.id))
      .where(eq(pkgFiles.status, "pending"))
      .orderBy(desc(pkgFiles.createdAt))
      .limit(50);
  } catch {
    // DB offline
  }

  return (
    <div className="animate-fade-in">
      <h1
        style={{
          fontSize: "var(--fs-3xl)",
          fontWeight: 800,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.03em",
          marginBottom: "var(--space-4)",
        }}
      >
        Mod Queue
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: "var(--fs-md)",
          marginBottom: "var(--space-24)",
        }}
      >
        {pendingPkgs.length} submissions waiting for review
      </p>

      {pendingPkgs.length === 0 ? (
        <GlassCard
          variant="content"
          cornerRadius={16}
          padding="60px 20px"
          style={{ textAlign: "center" }}
        >
          <div style={{ fontSize: "var(--fs-6xl)", marginBottom: "var(--space-12)", opacity: 0.3 }}>
            ✓
          </div>
          <div
            style={{
              color: "var(--color-success-bright)",
              fontWeight: 600,
              fontSize: "var(--fs-2xl)",
            }}
          >
            Queue is clear
          </div>
          <div
            style={{
              color: "var(--color-text-faint)",
              fontSize: "var(--fs-md)",
              marginTop: "var(--space-4)",
            }}
          >
            No pending submissions
          </div>
        </GlassCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-12)" }}>
          {pendingPkgs.map((pkg) => (
            <GlassCard key={pkg.id} variant="content" cornerRadius={16} padding="20px 24px">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-10)",
                      marginBottom: "var(--space-8)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "var(--fs-xl)",
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                        margin: 0,
                      }}
                    >
                      {pkg.title}
                    </h3>
                    {pkg.gamePlatform && (
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "var(--radius-xs)",
                          fontSize: "var(--fs-xs)",
                          fontWeight: 600,
                          color: "var(--color-accent-hover)",
                          background: "rgba(99,102,241,0.12)",
                          border: "1px solid rgba(99,102,241,0.2)",
                        }}
                      >
                        {pkg.gamePlatform}
                      </span>
                    )}
                    {pkg.version && (
                      <span
                        style={{
                          fontSize: "var(--fs-sm)",
                          color: "var(--color-text-faint)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        v{pkg.version}
                      </span>
                    )}
                  </div>

                  {pkg.description && (
                    <p
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "var(--fs-md)",
                        marginBottom: "var(--space-10)",
                        lineHeight: 1.5,
                      }}
                    >
                      {pkg.description.slice(0, 200)}
                      {pkg.description.length > 200 ? "..." : ""}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "var(--space-20)",
                      fontSize: "var(--fs-sm)",
                      color: "var(--color-text-faint)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "var(--space-4)",
                      }}
                    >
                      <IconCatalog size={12} /> {formatBytes(pkg.sizeBytes)}
                    </span>
                    {pkg.gameTitle && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "var(--space-4)",
                        }}
                      >
                        <IconSettings size={12} /> {pkg.gameTitle}
                      </span>
                    )}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "var(--space-4)",
                      }}
                    >
                      <IconUser size={12} /> {pkg.uploaderName ?? "anonymous"}
                    </span>
                    <span>{pkg.createdAt.toISOString().slice(0, 10)}</span>
                    {pkg.fwRequired && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "var(--space-4)",
                        }}
                      >
                        <IconSettings size={12} /> FW {pkg.fwRequired}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: "var(--space-10)",
                      fontSize: "var(--fs-xs)",
                      color: "var(--color-text-faint)",
                      fontFamily: "var(--font-mono)",
                      wordBreak: "break-all",
                    }}
                  >
                    SHA-256: {pkg.sha256}
                  </div>
                </div>

                {/* Actions */}
                <QueueActions pkgId={pkg.id} />
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
