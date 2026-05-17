"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// ─── Page transition wrapper ─────────────────────────────────────
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Fade in wrapper ─────────────────────────────────────────────
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function FadeIn({ children, delay = 0, duration = 0.4, className, style }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── Staggered list container + item ─────────────────────────────
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

interface StaggerListProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function StaggerList({ children, className, style }: StaggerListProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, style }: StaggerListProps) {
  return (
    <motion.div variants={staggerItem} className={className} style={style}>
      {children}
    </motion.div>
  );
}

// ─── Scale on tap (buttons, cards) ───────────────────────────────
interface ScaleTapProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function ScaleTap({ children, className, style, onClick }: ScaleTapProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.94, y: 1 }}
      transition={{ type: "spring", stiffness: 480, damping: 22, mass: 0.6 }}
      className={className}
      style={style}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// ─── Slide in from direction ─────────────────────────────────────
interface SlideInProps {
  children: ReactNode;
  from?: "left" | "right" | "top" | "bottom";
  delay?: number;
  className?: string;
}

const offsets = {
  left: { x: -30, y: 0 },
  right: { x: 30, y: 0 },
  top: { x: 0, y: -30 },
  bottom: { x: 0, y: 30 },
};

export function SlideIn({ children, from = "bottom", delay = 0, className }: SlideInProps) {
  const offset = offsets[from];
  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Scroll-triggered fade-in ────────────────────────────────────
interface InViewFadeProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
}

export function InViewFade({ children, delay = 0, y = 24, className, style, once = true }: InViewFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, amount: 0.15, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── AnimatePresence re-export for convenience ───────────────────
export { AnimatePresence, motion };
