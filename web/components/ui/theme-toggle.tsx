"use client";

import type React from "react";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolved] = useState<"dark" | "light">("dark");

  // Read from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("pkgv-theme") as Theme | null;
    if (saved && ["dark", "light", "system"].includes(saved)) {
      setThemeState(saved);
    }
  }, []);

  // Resolve system theme
  useEffect(() => {
    if (theme === "system") {
      const sys = getSystemTheme();
      setResolved(sys);
      const mq = window.matchMedia("(prefers-color-scheme: light)");
      const handler = (e: MediaQueryListEvent) => setResolved(e.matches ? "light" : "dark");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    setResolved(theme);
  }, [theme]);

  // Apply to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("pkgv-theme", t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
    {
      value: "dark",
      label: "Dark",
      icon: (
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden={true}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ),
    },
    {
      value: "light",
      label: "Light",
      icon: (
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden={true}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ),
    },
    {
      value: "system",
      label: "Auto",
      icon: (
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden={true}
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
  ];

  return (
    <div className="segmented-shell" style={{ display: "flex", gap: 2, padding: 3 }}>
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          style={{
            padding: "5px 12px",
            borderRadius: 12,
            border: "none",
            background: theme === opt.value ? "rgba(99, 102, 241, 0.15)" : "transparent",
            color: theme === opt.value ? "var(--color-accent-hover)" : "var(--color-text-muted)",
            cursor: "pointer",
            fontSize: "var(--fs-sm)",
            fontFamily: "var(--font-sans)",
            fontWeight: theme === opt.value ? 600 : 400,
            transition: "background var(--dur-fast), color var(--dur-fast)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  );
}
