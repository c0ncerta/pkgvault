"use client";

import dynamic from "next/dynamic";
import { useId } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";

type BaseVariant =
  | "surface-content"
  | "surface-elevated"
  | "glass-regular"
  | "glass-regular-strong";

type LiquidGlassSurfaceProps = {
  displacementScale: number;
  blurAmount: number;
  saturation: number;
  aberrationIntensity: number;
  elasticity: number;
  cornerRadius: number;
  className?: string;
  padding?: string;
  style?: CSSProperties;
  children: ReactNode;
  onClick?: () => void;
  mouseContainer?: RefObject<HTMLElement | null> | null;
  baseVariant: BaseVariant;
};

type LiquidGlassEnhancerProps = Omit<LiquidGlassSurfaceProps, "children" | "baseVariant"> & {
  surfaceId: string;
};

const LiquidGlassEnhancer = dynamic<LiquidGlassEnhancerProps>(
  () => import("./liquid-glass-enhancer").then((mod) => mod.LiquidGlassEnhancer),
  { ssr: false },
);

export function LiquidGlassSurface({
  padding,
  style,
  className = "",
  cornerRadius,
  children,
  onClick,
  baseVariant,
  ...props
}: LiquidGlassSurfaceProps) {
  const surfaceId = useId();
  const baseStyle = {
    ...style,
    ...(padding ? { padding } : null),
    borderRadius: `${cornerRadius}px`,
  } satisfies CSSProperties;

  return (
    <div
      data-surface-id={surfaceId}
      className={`liquid-glass-surface relative ${baseVariant} ${className}`.trim()}
      style={baseStyle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.(e as any);
      }}
      onClick={onClick}
    >
      {children}
      <div className="liquid-glass-surface__overlay" aria-hidden="true">
        <LiquidGlassEnhancer
          {...props}
          surfaceId={surfaceId}
          className="liquid-glass-surface__enhancer h-full w-full"
          padding="0"
          style={{
            width: "100%",
            height: "100%",
            borderRadius: `${cornerRadius}px`,
            background: "transparent",
          }}
          cornerRadius={cornerRadius}
        />
      </div>
    </div>
  );
}

export type { LiquidGlassSurfaceProps, BaseVariant };
