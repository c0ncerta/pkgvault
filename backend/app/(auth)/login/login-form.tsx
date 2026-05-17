"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 18px",
  borderRadius: 999,
  border: "1px solid rgba(255, 255, 255, 0.10)",
  background: "rgba(255, 255, 255, 0.06)",
  color: "#e0e0e0",
  fontSize: "0.95rem",
  fontFamily: "var(--font-sans)",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
  boxSizing: "border-box" as const,
  boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--color-text-secondary)",
  fontSize: "0.8rem",
  fontWeight: 500,
  marginBottom: 6,
  letterSpacing: "0.02em",
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="login-email" style={labelStyle}>
          Email
        </label>
        <input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#6366f1";
            e.currentTarget.style.boxShadow =
              "0 0 0 3px rgba(99, 102, 241, 0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label htmlFor="login-password" style={labelStyle}>
          Password
        </label>
        <input
          id="login-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="current-password"
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#6366f1";
            e.currentTarget.style.boxShadow =
              "0 0 0 3px rgba(99, 102, 241, 0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#fca5a5",
            fontSize: "0.85rem",
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px 24px",
          borderRadius: 10,
          border: "none",
          background: loading
            ? "rgba(99, 102, 241, 0.5)"
            : "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff",
          fontSize: "0.95rem",
          fontWeight: 600,
          fontFamily: "var(--font-sans)",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "transform 0.15s, box-shadow 0.15s",
          boxShadow: "0 4px 20px rgba(99, 102, 241, 0.3)",
        }}
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
