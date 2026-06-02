"use client";

import { GlassCard } from "@/components/liquid/glass";
import { IconCheck, IconQueue } from "@/components/ui/icons";
import { Tag } from "@/components/ui/tag";
import Link from "next/link";
import { useState } from "react";

interface PkgItem {
  id: string;
  title: string;
  version: string | null;
  sizeBytes: number;
  status: string;
  downloadCount: number;
  createdAt: string;
  gamePlatform: string | null;
}

interface PostItem {
  id: string;
  bodyMd: string;
  score: number;
  createdAt: string;
  threadTitle: string | null;
}

interface Stats {
  pkgsTotal: number;
  pkgsApproved: number;
  pkgsPending: number;
  forumPosts: number;
}

type Tab = "approved" | "pending" | "posts";

export function ProfileTabs({
  pkgs,
  posts,
  stats,
}: { pkgs: PkgItem[]; posts: PostItem[]; stats: Stats }) {
  const [tab, setTab] = useState<Tab>("approved");

  const tabs: Array<{ key: Tab; label: string; count?: number }> = [
    { key: "approved", label: "Approved PKGs", count: stats.pkgsApproved },
    { key: "pending", label: "Pending", count: stats.pkgsPending },
    { key: "posts", label: "Forum posts", count: stats.forumPosts },
  ];

  const filteredPkgs = pkgs.filter((p) =>
    tab === "approved"
      ? p.status === "approved"
      : tab === "pending"
        ? p.status === "pending"
        : false,
  );

  return (
    <div>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 16,
        }}
      >
        {tabs.map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setTab(t.key)}
            className="btn-ghost"
            style={{
              borderBottom:
                tab === t.key ? "2px solid var(--color-accent)" : "2px solid transparent",
              borderRadius: 0,
              padding: "12px 16px",
              marginBottom: -1,
              color: tab === t.key ? "#e8e8ed" : "#64748b",
              fontWeight: tab === t.key ? 600 : 400,
            }}
          >
            {t.label} {t.count !== undefined && t.count > 0 ? `(${t.count})` : ""}
          </button>
        ))}
      </div>

      {/* PKG list */}
      {(tab === "approved" || tab === "pending") &&
        (filteredPkgs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredPkgs.map((pkg, i) => (
              <Link
                key={pkg.id}
                href={`/catalog/${pkg.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  borderRadius: 8,
                  textDecoration: "none",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  transition: "background var(--dur-fast)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "var(--fs-md)",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {pkg.title}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--fs-xs)",
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {new Date(pkg.createdAt).toLocaleDateString()} · {pkg.downloadCount} downloads
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {pkg.gamePlatform && <Tag>{pkg.gamePlatform}</Tag>}
                  <span
                    style={{
                      fontSize: "var(--fs-sm)",
                      color: "var(--color-text-secondary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {pkg.version ?? "—"}
                  </span>
                  <Tag variant={pkg.status === "approved" ? "success" : "warning"}>
                    {pkg.status === "approved" ? (
                      <>
                        <IconCheck
                          size={12}
                          style={{ display: "inline", verticalAlign: "middle" }}
                        />{" "}
                        approved
                      </>
                    ) : (
                      <>
                        <IconQueue
                          size={12}
                          style={{ display: "inline", verticalAlign: "middle" }}
                        />{" "}
                        pending
                      </>
                    )}
                  </Tag>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontSize: "var(--fs-md)",
            }}
          >
            No {tab} packages yet.
          </div>
        ))}

      {/* Posts list */}
      {tab === "posts" &&
        (posts.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {posts.map((post) => (
              <GlassCard key={post.id} padding="14px">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "var(--fs-base)", color: "#818cf8", fontWeight: 500 }}>
                    {post.threadTitle ?? "Thread"}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--fs-xs)",
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {new Date(post.createdAt).toLocaleDateString()} · ▲{post.score}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "var(--fs-md)",
                    color: "var(--color-text-primary)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {post.bodyMd.length > 200 ? `${post.bodyMd.slice(0, 200)}…` : post.bodyMd}
                </p>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontSize: "var(--fs-md)",
            }}
          >
            No forum posts yet.
          </div>
        ))}
    </div>
  );
}
