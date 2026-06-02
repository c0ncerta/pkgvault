"use client";

import LiquidGlass from "liquid-glass-react";
import { useEffect, useState } from "react";
import type { CSSProperties, RefObject } from "react";

type LiquidGlassEnhancerProps = {
  displacementScale: number;
  blurAmount: number;
  saturation: number;
  aberrationIntensity: number;
  elasticity: number;
  cornerRadius: number;
  className?: string;
  padding?: string;
  style?: CSSProperties;
  onClick?: () => void;
  mouseContainer?: RefObject<HTMLElement | null> | null;
  surfaceId: string;
};

export function LiquidGlassEnhancer({
  surfaceId,
  className = "",
  ...props
}: LiquidGlassEnhancerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <LiquidGlass {...props} className={className}>
      <span
        aria-hidden="true"
        data-surface-enhancement-for={surfaceId}
        className="block h-full w-full opacity-0"
      />
    </LiquidGlass>
  );
}
