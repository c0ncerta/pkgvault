import { pkgFiles, users } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

const getLeaderboard = unstable_cache(
  async () => {
    return await db
      .select({
        id: users.id,
        name: users.name,
        count: sql<number>`count(${pkgFiles.id})::int`,
        downloads: sql<number>`coalesce(sum(${pkgFiles.downloadCount}), 0)::int`,
      })
      .from(pkgFiles)
      .innerJoin(users, eq(pkgFiles.uploaderId, users.id))
      .where(sql`${pkgFiles.deletedAt} IS NULL AND ${pkgFiles.status} = 'approved'`)
      .groupBy(users.id, users.name)
      .orderBy(desc(sql`count(${pkgFiles.id})`))
      .limit(5);
  },
  ["home-leaderboard"],
  { revalidate: 300, tags: ["pkgs"] },
);
import { GlassCard } from "@/components/liquid/glass";

export async function HomeLeaderboard() {
  let top: Array<{ id: string; name: string; count: number; downloads: number }> = [];

  try {
    top = await getLeaderboard();
  } catch {
    // DB offline
  }

  if (top.length === 0) return null;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <GlassCard padding="22px 24px" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3
          style={{ fontSize: "var(--fs-lg)", fontWeight: 700, color: "var(--color-text-primary)" }}
        >
          Top contributors
        </h3>
        <span
          style={{
            fontSize: "var(--fs-xs)",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          all-time
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {top.map((u, i) => (
          <div
            key={u.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 10px",
              borderRadius: "var(--radius-sm)",
              background: i === 0 ? "rgba(245, 158, 11, 0.06)" : "transparent",
            }}
          >
            <span
              style={{
                width: 22,
                textAlign: "center",
                fontSize: i < 3 ? "1.05rem" : "0.75rem",
                color: i < 3 ? undefined : "var(--color-text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {medals[i] ?? `${i + 1}`}
            </span>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                flexShrink: 0,
                background: `linear-gradient(135deg, hsl(${(i * 71) % 360}, 60%, 55%), hsl(${(i * 71 + 30) % 360}, 60%, 40%))`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "var(--fs-xs)",
                color: "#fff",
              }}
            >
              {u.name.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "var(--fs-md)",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {u.name}
              </div>
              <div
                style={{
                  fontSize: "var(--fs-xs)",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {u.count} pkgs · ↓ {u.downloads.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
