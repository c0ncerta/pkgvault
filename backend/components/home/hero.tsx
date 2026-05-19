"use client";

import { GlassCard } from "@/components/liquid/glass";
import { Logo } from "@/components/ui/logo";
import { motion } from "framer-motion";
import Link from "next/link";

export function HomeHero() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 48px",
        textAlign: "center",
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <GlassCard variant="elevated" cornerRadius={22} padding="14px">
          <Logo size={64} />
        </GlassCard>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        style={{
          fontSize: "3.5rem",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 1.05,
          marginTop: 24,
          marginBottom: 16,
          background: "linear-gradient(135deg, #e8e8ed 0%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        PKGVault
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
        style={{
          fontSize: "1.125rem",
          color: "var(--color-text-secondary)",
          lineHeight: 1.6,
          marginBottom: 36,
          maxWidth: 520,
        }}
      >
        Community-driven PKG file archive. Browse, upload, and discuss game packages with integrity
        verification.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
        style={{ display: "flex", gap: 12, justifyContent: "center" }}
      >
        <motion.div
          whileHover={{ scale: 1.04, y: -3 }}
          whileTap={{ scale: 0.94, y: 1 }}
          transition={{ type: "spring", stiffness: 480, damping: 22, mass: 0.6 }}
        >
          <Link
            href="/catalog"
            className="btn-primary"
            style={{ padding: "14px 32px", fontSize: "1rem" }}
          >
            Browse Catalog
          </Link>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.04, y: -3 }}
          whileTap={{ scale: 0.94, y: 1 }}
          transition={{ type: "spring", stiffness: 480, damping: 22, mass: 0.6 }}
        >
          <Link
            href="/register"
            className="btn-secondary"
            style={{ padding: "14px 32px", fontSize: "1rem" }}
          >
            Join Community
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
