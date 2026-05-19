"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import { LiquidGlassSurface } from "./liquid-glass-surface";

// ─── GlassCard — content panels, cards, stat blocks ─────────────
type GlassCardVariant = "content" | "elevated";

const CARD_PRESETS: Record<
  GlassCardVariant,
  {
    displacementScale: number;
    blurAmount: number;
    saturation: number;
    aberrationIntensity: number;
    elasticity: number;
    cornerRadius: number;
  }
> = {
  content: {
    displacementScale: 35,
    blurAmount: 0.04,
    saturation: 190,
    aberrationIntensity: 1,
    elasticity: 0.06,
    cornerRadius: 22,
  },
  elevated: {
    displacementScale: 45,
    blurAmount: 0.05,
    saturation: 175,
    aberrationIntensity: 1.5,
    elasticity: 0.08,
    cornerRadius: 22,
  },
};

export function GlassCard({
  variant = "content",
  className = "",
  padding,
  style,
  children,
  onClick,
  cornerRadius,
}: {
  variant?: GlassCardVariant;
  className?: string;
  padding?: string;
  style?: CSSProperties;
  children: ReactNode;
  onClick?: () => void;
  cornerRadius?: number;
}) {
  const preset = CARD_PRESETS[variant];

  return (
    <LiquidGlassSurface
      baseVariant={variant === "content" ? "surface-content" : "surface-elevated"}
      displacementScale={preset.displacementScale}
      blurAmount={preset.blurAmount}
      saturation={preset.saturation}
      aberrationIntensity={preset.aberrationIntensity}
      elasticity={preset.elasticity}
      cornerRadius={cornerRadius ?? preset.cornerRadius}
      className={className}
      padding={padding}
      style={style}
      onClick={onClick}
    >
      {children}
    </LiquidGlassSurface>
  );
}

// ─── GlassPanel — controls, pills, nav, dock, modals ────────────
type GlassPanelVariant = "regular" | "strong";

const PANEL_PRESETS: Record<
  GlassPanelVariant,
  {
    displacementScale: number;
    blurAmount: number;
    saturation: number;
    aberrationIntensity: number;
    elasticity: number;
    cornerRadius: number;
  }
> = {
  regular: {
    displacementScale: 50,
    blurAmount: 0.05,
    saturation: 180,
    aberrationIntensity: 1.5,
    elasticity: 0.15,
    cornerRadius: 999,
  },
  strong: {
    displacementScale: 64,
    blurAmount: 0.07,
    saturation: 190,
    aberrationIntensity: 2,
    elasticity: 0.25,
    cornerRadius: 32,
  },
};

export function GlassPanel({
  variant = "regular",
  className = "",
  padding,
  style,
  children,
  onClick,
  cornerRadius,
  mouseContainer,
}: {
  variant?: GlassPanelVariant;
  className?: string;
  padding?: string;
  style?: CSSProperties;
  children: ReactNode;
  onClick?: () => void;
  cornerRadius?: number;
  mouseContainer?: RefObject<HTMLElement | null> | null;
}) {
  const preset = PANEL_PRESETS[variant];

  return (
    <LiquidGlassSurface
      baseVariant={variant === "regular" ? "glass-regular" : "glass-regular-strong"}
      displacementScale={preset.displacementScale}
      blurAmount={preset.blurAmount}
      saturation={preset.saturation}
      aberrationIntensity={preset.aberrationIntensity}
      elasticity={preset.elasticity}
      cornerRadius={cornerRadius ?? preset.cornerRadius}
      className={className}
      padding={padding}
      style={style}
      onClick={onClick}
      mouseContainer={mouseContainer}
    >
      {children}
    </LiquidGlassSurface>
  );
}

// ─── GlassStat — number + label block ────────────────────────────
export function GlassStat({ value, label }: { value: string | number; label: string }) {
  return (
    <GlassCard
      variant="content"
      cornerRadius={16}
      padding="12px 8px"
      style={{ minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
          {value}
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: 2 }}>
          {label}
        </div>
      </div>
    </GlassCard>
  );
}
