"use client";

import { createContext, useContext, useRef } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { LiquidGlassSurface } from "./liquid-glass-surface";
import type { GlassTint } from "./liquid-glass-surface";

const GlassEffectContainerContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export function GlassEffectContainer({
  children,
  className = "",
  spacing = 28,
  style,
}: {
  children: ReactNode;
  className?: string;
  spacing?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <GlassEffectContainerContext.Provider value={ref}>
      <div
        ref={ref}
        className={`glass-effect-container ${className}`.trim()}
        style={
          {
            "--glass-container-spacing": `${spacing}px`,
            ...style,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </GlassEffectContainerContext.Provider>
  );
}

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
    displacementScale: 42,
    blurAmount: 0.05,
    saturation: 205,
    aberrationIntensity: 1.25,
    elasticity: 0.08,
    cornerRadius: 22,
  },
  elevated: {
    displacementScale: 58,
    blurAmount: 0.065,
    saturation: 205,
    aberrationIntensity: 1.8,
    elasticity: 0.12,
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
  tint,
  interactive,
  mouseContainer,
}: {
  variant?: GlassCardVariant;
  className?: string;
  padding?: string;
  style?: CSSProperties;
  children: ReactNode;
  onClick?: () => void;
  cornerRadius?: number;
  tint?: GlassTint;
  interactive?: boolean;
  mouseContainer?: RefObject<HTMLElement | null> | null;
}) {
  const preset = CARD_PRESETS[variant];
  const containerRef = useContext(GlassEffectContainerContext);

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
      tint={tint}
      interactive={interactive}
      mouseContainer={mouseContainer ?? containerRef}
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
    displacementScale: 58,
    blurAmount: 0.06,
    saturation: 205,
    aberrationIntensity: 1.8,
    elasticity: 0.18,
    cornerRadius: 999,
  },
  strong: {
    displacementScale: 78,
    blurAmount: 0.08,
    saturation: 215,
    aberrationIntensity: 2.4,
    elasticity: 0.3,
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
  tint,
  interactive,
}: {
  variant?: GlassPanelVariant;
  className?: string;
  padding?: string;
  style?: CSSProperties;
  children: ReactNode;
  onClick?: () => void;
  cornerRadius?: number;
  mouseContainer?: RefObject<HTMLElement | null> | null;
  tint?: GlassTint;
  interactive?: boolean;
}) {
  const preset = PANEL_PRESETS[variant];
  const containerRef = useContext(GlassEffectContainerContext);

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
      mouseContainer={mouseContainer ?? containerRef}
      tint={tint}
      interactive={interactive}
    >
      {children}
    </LiquidGlassSurface>
  );
}

// ─── GlassStat — number + label block ────────────────────────────
export function GlassStat({ value, label }: { value: ReactNode; label: string }) {
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
