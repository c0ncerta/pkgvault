"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Route-change transition wrapper.
 *
 * Next.js re-mounts `template.tsx` on every navigation while `layout.tsx`
 * persists, so we use it to animate the page-level content in/out without
 * resetting the navbar, ambient orbs, or other layout chrome.
 *
 * Keyed on pathname so framer-motion treats each route as a distinct subtree
 * and runs the enter animation when the URL changes.
 */
export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{ minHeight: "100%" }}
    >
      {children}
    </motion.div>
  );
}
