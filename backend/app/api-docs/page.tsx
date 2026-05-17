import { GlassCard } from "@/components/liquid/glass";

const endpoints = [
  {
    method: "GET",
    path: "/api/catalog",
    desc: "List all approved PKGs with pagination and filters",
    auth: false,
  },
  {
    method: "GET",
    path: "/api/catalog/:id",
    desc: "Get PKG details including download sources",
    auth: false,
  },
  { method: "POST", path: "/api/upload", desc: "Upload a new PKG file for review", auth: true },
  {
    method: "GET",
    path: "/api/forum/threads",
    desc: "List forum threads with pagination",
    auth: false,
  },
  { method: "GET", path: "/api/forum/threads/:id", desc: "Get thread with posts", auth: false },
  { method: "POST", path: "/api/forum/threads", desc: "Create a new thread", auth: true },
  { method: "POST", path: "/api/forum/posts", desc: "Reply to a thread", auth: true },
  { method: "POST", path: "/api/forum/vote", desc: "Upvote or downvote a post", auth: true },
  { method: "GET", path: "/api/admin/queue", desc: "List pending PKGs for review", auth: true },
  {
    method: "PATCH",
    path: "/api/admin/pkgs/:id/status",
    desc: "Approve or reject a PKG",
    auth: true,
  },
];

const methodColors: Record<string, string> = {
  GET: "#34d399",
  POST: "#818cf8",
  PATCH: "#fbbf24",
  DELETE: "#f87171",
};

export default function ApiDocsPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 64px" }}>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "var(--color-text-primary)",
          marginBottom: 8,
        }}
      >
        API Reference
      </h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: 12 }}>
        All endpoints return JSON. Authentication uses session cookies via Better-Auth.
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        <span className="tag" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>
          Base URL: /api
        </span>
        <span className="tag" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>
          Content-Type: application/json
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {endpoints.map((ep) => (
          <GlassCard key={ep.path} padding="14px 18px">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: methodColors[ep.method] ?? "var(--color-text-muted)",
                  width: 44,
                  flexShrink: 0,
                }}
              >
                {ep.method}
              </span>
              <code
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  color: "var(--color-text-primary)",
                  flex: 1,
                }}
              >
                {ep.path}
              </code>
              {ep.auth && (
                <span
                  className="tag tag-warning"
                  style={{ fontSize: "0.6rem", padding: "1px 6px" }}
                >
                  AUTH
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--color-text-muted)",
                margin: "6px 0 0 56px",
                lineHeight: 1.4,
              }}
            >
              {ep.desc}
            </p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
