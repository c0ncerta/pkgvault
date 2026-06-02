"use client";

import { type HTMLMotionProps, motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

const MotionLink = motion.create(Link);

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface LiquidButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  href?: string;
}

const SIZE_CLASS: Record<Size, string> = {
  sm: "btn-size-sm",
  md: "btn-size-md",
  lg: "btn-size-lg",
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

/**
 * LiquidButton — iOS-style stacked button with spring press animation.
 *
 * Renders the same visual layers as the .btn-* CSS classes (so it looks
 * identical to existing buttons), but adds:
 *   - Spring physics on press (squish + release recoil)
 *   - Hover lift via framer-motion (smoother than CSS for chained tweens)
 *   - Optional icon slots
 *   - Polymorphic rendering as a Link when href is provided.
 *
 * Use this for high-impact CTAs (downloads, submits, hero actions). For
 * everyday buttons the plain `.btn-*` classes are fine.
 */
export function LiquidButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  iconLeft,
  iconRight,
  style,
  className = "",
  disabled,
  href,
  ...rest
}: LiquidButtonProps) {
  const commonProps = {
    whileHover: disabled ? undefined : { scale: 1.01 },
    whileTap: disabled ? undefined : { scale: 0.97 },
    transition: { type: "spring" as const, stiffness: 480, damping: 22, mass: 0.6 },
    className: `${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`.trim(),
    style: {
      width: fullWidth ? "100%" : undefined,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-8)",
      textDecoration: "none",
      ...style,
    },
  };

  const content = (
    <>
      {iconLeft && <span style={{ display: "inline-flex", fontSize: "0.95em" }}>{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span style={{ display: "inline-flex", fontSize: "0.95em" }}>{iconRight}</span>}
    </>
  );

  if (href && !disabled) {
    return (
      // biome-ignore lint/suspicious/noExplicitAny: polymorphic motion/link props are type-erased here
      <MotionLink href={href} {...commonProps} {...(rest as any)}>
        {content}
      </MotionLink>
    );
  }

  return (
    <motion.button disabled={disabled} {...commonProps} {...rest}>
      {content}
    </motion.button>
  );
}
