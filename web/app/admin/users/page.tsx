import { GlassCard, GlassStat } from "@/components/liquid/glass";
import { users } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, sql } from "drizzle-orm";

export default async function AdminUsersPage() {
  let userList: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: Date;
  }> = [];
  let totalCount = 0;

  try {
    userList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(100);

    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    totalCount = Number(result[0]?.count ?? 0);
  } catch {
    // DB offline
  }

  const admins = userList.filter((u) => u.role === "admin").length;
  const mods = userList.filter((u) => u.role === "mod").length;

  return (
    <div
      className="animate-fade-in"
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-20)" }}
    >
      <div>
        <h1
          style={{
            fontSize: "var(--fs-3xl)",
            fontWeight: 800,
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-4)",
          }}
        >
          Users
        </h1>
        <p style={{ fontSize: "var(--fs-base)", color: "var(--color-text-muted)" }}>
          Manage registered accounts
        </p>
      </div>

      {/* Stats */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-10)" }}
      >
        <GlassStat value={totalCount} label="Total users" />
        <GlassStat value={admins} label="Admins" />
        <GlassStat value={mods} label="Moderators" />
        <GlassStat value={totalCount - admins - mods} label="Members" />
      </div>

      {/* Table */}
      <GlassCard padding="0" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fs-base)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["User", "Email", "Role", "Joined"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "var(--fs-xs)",
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {userList.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom:
                      i < userList.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}
                >
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-10)" }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "var(--fs-2xs)",
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {(u.name ?? "?").slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
                        {u.name ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-text-secondary)",
                      fontSize: "var(--fs-sm)",
                    }}
                  >
                    {u.email}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <span
                      className={`tag ${u.role === "admin" ? "tag-warning" : u.role === "mod" ? "tag-accent" : ""}`}
                      style={{ fontSize: "var(--fs-2xs)" }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--fs-xs)",
                    }}
                  >
                    {u.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
              {userList.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: "var(--space-32)",
                      textAlign: "center",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
