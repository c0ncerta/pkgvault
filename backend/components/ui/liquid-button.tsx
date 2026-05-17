"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface LiquidButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const SIZE_CLASS: Record<Size, string> = {
  sm: "btn-size-sm",
  md: "btn-size-md",
  lg: "btn-size-lg",
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary:   "btn-primary",
  secondary: "btn-secondary",
  ghost:     "btn-ghost",
  danger:    "btn-danger",
};

/**
 * LiquidButton — iOS-style stacked button with spring press animation.
 *
 * Renders the same visual layers as the .btn-* CSS classes (so it looks
 * identical to existing buttons), but adds:
 *   - Spring physics on press (squish + release recoil)
 *   - Hover lift via framer-motion (smoother than CSS for chained tweens)
 *   - Optional icon slots
 *
 * Use this for high-impact CTAs (downloads, submits, hero actions). For
 * everyday buttons the plain `.btn-*` classes are fine.
 */
export function LiquidButton({
  children, variant = "primary", size = "md",
  fullWidth, iconLeft, iconRight,
  style, className = "", disabled, ...rest
}: LiquidButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -2, scale: 1.015 }}
      whileTap={disabled ? undefined : { y: 1, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 480, damping: 22, mass: 0.6 }}
      disabled={disabled}
      className={`${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
      style={{
        width: fullWidth ? "100%" : undefined,
        ...style,
      }}
      {...rest}
    >
      {iconLeft && <span style={{ display: "inline-flex", fontSize: "0.95em" }}>{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span style={{ display: "inline-flex", fontSize: "0.95em" }}>{iconRight}</span>}
    </motion.button>
  );
}
