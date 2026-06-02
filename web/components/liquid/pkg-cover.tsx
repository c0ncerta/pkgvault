"use client";

import { motion } from "framer-motion";

// ─── PKG Cover card — gradient game cover (from liquid reference) ─
interface PkgCoverProps {
  name: string;
  platform: string;
  color1: string;
  color2: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizes = {
  sm: { width: 120, fontSize: "var(--fs-sm)", platSize: 8 },
  md: { width: "100%", fontSize: "var(--fs-md)", platSize: 9 },
  lg: { width: "100%", fontSize: "var(--fs-xl)", platSize: 10 },
} as const;

export function PkgCover({ name, platform, color1, color2, size = "md", onClick }: PkgCoverProps) {
  const s = sizes[size];

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      style={{
        width: s.width,
        aspectRatio: "3/4",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: `linear-gradient(155deg, ${color1} 0%, ${color2} 100%)`,
        position: "relative",
        boxShadow: `0 8px 24px ${color1}40`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* Highlight */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.35), transparent 60%)",
        }}
      />
      {/* Scan lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0 12px, rgba(255,255,255,0.05) 12px 13px)",
        }}
      />
      {/* Platform badge */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          padding: "2px 8px",
          borderRadius: "var(--radius-pill)",
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
          color: "#fff",
          fontSize: s.platSize,
          fontWeight: 700,
          letterSpacing: "0.06em",
        }}
      >
        {platform}
      </div>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 10,
          color: "#fff",
          fontSize: s.fontSize,
          fontWeight: 700,
          lineHeight: 1.1,
          textShadow: "0 1px 3px rgba(0,0,0,0.45)",
        }}
      >
        {name}
      </div>
    </motion.div>
  );
}
