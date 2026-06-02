"use client";

import { GlassCard } from "@/components/liquid/glass";
import { StaggerItem, StaggerList } from "@/components/motion/transitions";
import { IconLock, IconShield, IconUsers } from "@/components/ui/icons";
import type { ComponentType } from "react";

const features: Array<{
  icon: ComponentType<{ size?: number; style?: React.CSSProperties }>;
  title: string;
  desc: string;
  color: string;
}> = [
  {
    icon: IconLock,
    title: "SHA-256 Verified",
    desc: "Every file hash-checked for integrity",
    color: "#34d399",
  },
  {
    icon: IconUsers,
    title: "Community Driven",
    desc: "Upload, review, and discuss together",
    color: "var(--color-accent-hover)",
  },
  {
    icon: IconShield,
    title: "Mod Reviewed",
    desc: "All submissions manually approved",
    color: "var(--color-warning)",
  },
];

export function HomeFeatures() {
  return (
    <StaggerList
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
        maxWidth: 1100,
        width: "100%",
        margin: "80px auto 0",
        padding: "0 24px",
      }}
    >
      {features.map((f) => {
        const Icon = f.icon;
        return (
          <StaggerItem key={f.title}>
            <GlassCard variant="content" cornerRadius={18} padding="24px 20px">
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-base)",
                    margin: "0 auto 12px",
                    background: `${f.color}15`,
                    border: `1px solid ${f.color}25`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} style={{ color: f.color }} />
                </div>
                <h3
                  style={{
                    fontSize: "var(--fs-lg)",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: 6,
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: "var(--fs-base)",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.4,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            </GlassCard>
          </StaggerItem>
        );
      })}
    </StaggerList>
  );
}
