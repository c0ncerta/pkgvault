import { GlassCard } from "@/components/liquid/glass";
import { auditLog, users } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

const actionColors: Record<string, string> = {
  approve: "#34d399",
  "pkg.approve": "#34d399",
  reject: "#f87171",
  "pkg.reject": "#f87171",
  delete: "#f87171",
  ban: "#f87171",
  unban: "#34d399",
  promote: "#fbbf24",
  demote: "#f97316",
  create: "#818cf8",
  update: "#38bdf8",
  "pkg.update": "#38bdf8",
};

function getActionColor(action: string) {
  const normalized = action.toLowerCase();
  return actionColors[normalized] ?? "var(--color-text-muted)";
}

function getStatusFromAction(action: string) {
  if (action.endsWith(".approve") || action === "approve") return "approved";
  if (action.endsWith(".reject") || action === "reject") return "rejected";
  return null;
}

function summarizeMetadata(action: string, metadata: unknown) {
  if (metadata == null) return null;
  if (typeof metadata === "string") return metadata;
  if (typeof metadata !== "object" || Array.isArray(metadata)) return JSON.stringify(metadata);

  const data = metadata as Record<string, unknown>;
  const previousStatus = typeof data["previousStatus"] === "string" ? data["previousStatus"] : null;
  const newStatus =
    typeof data["newStatus"] === "string" ? data["newStatus"] : getStatusFromAction(action);
  const reason =
    typeof data["reason"] === "string" && data["reason"].trim() ? data["reason"] : null;

  const parts: string[] = [];
  if (previousStatus && newStatus) parts.push(`status: ${previousStatus} -> ${newStatus}`);
  if (reason) parts.push(`reason: ${reason}`);

  return parts.length > 0 ? parts.join(" · ") : JSON.stringify(metadata);
}

export default async function AdminAuditPage() {
  let entries: Array<{
    id: string;
    action: string;
    targetType: string | null;
    targetId: string | null;
    metadata: unknown;
    createdAt: Date;
    actorName: string | null;
  }> = [];

  try {
    entries = await db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        targetType: auditLog.targetType,
        targetId: auditLog.targetId,
        metadata: auditLog.metadata,
        createdAt: auditLog.createdAt,
        actorName: users.name,
      })
      .from(auditLog)
      .leftJoin(users, eq(auditLog.actorId, users.id))
      .orderBy(desc(auditLog.createdAt))
      .limit(100);
  } catch {
    // DB offline
  }

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1
          style={{
            fontSize: "var(--fs-3xl)",
            fontWeight: 800,
            color: "var(--color-text-primary)",
            marginBottom: 4,
          }}
        >
          Audit Log
        </h1>
        <p style={{ fontSize: "var(--fs-base)", color: "var(--color-text-muted)" }}>
          Track all admin actions · {entries.length} entries
        </p>
      </div>

      {entries.length === 0 ? (
        <GlassCard padding="40px 24px" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--fs-md)" }}>
            No audit entries yet
          </p>
        </GlassCard>
      ) : (
        <GlassCard padding="0" style={{ overflow: "hidden" }}>
          {entries.map((e, i) => {
            const color = getActionColor(e.action);
            const metadataSummary = summarizeMetadata(e.action, e.metadata);
            return (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 18px",
                  borderBottom:
                    i < entries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}
              >
                {/* Action dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: color,
                    flexShrink: 0,
                  }}
                />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "var(--fs-base)",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {e.actorName ?? "System"}
                    </span>
                    <span
                      className="tag"
                      style={{
                        fontSize: "var(--fs-2xs)",
                        padding: "1px 6px",
                        borderColor: color,
                        color: color,
                      }}
                    >
                      {e.action}
                    </span>
                    {e.targetType && (
                      <span style={{ fontSize: "var(--fs-sm)", color: "var(--color-text-muted)" }}>
                        on {e.targetType}
                      </span>
                    )}
                  </div>
                  {metadataSummary && (
                    <p
                      style={{
                        fontSize: "var(--fs-sm)",
                        color: "var(--color-text-muted)",
                        margin: "2px 0 0",
                      }}
                    >
                      {metadataSummary}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                <span
                  style={{
                    fontSize: "var(--fs-xs)",
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                    flexShrink: 0,
                  }}
                >
                  {e.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                  {e.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })}
        </GlassCard>
      )}
    </div>
  );
}
