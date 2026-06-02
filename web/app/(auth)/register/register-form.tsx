"use client";

import { signUp } from "@/lib/auth-client";
import { useState } from "react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  background: "rgba(255, 255, 255, 0.04)",
  color: "var(--color-text-primary)",
  fontSize: "var(--fs-lg)",
  fontFamily: "var(--font-sans)",
  outline: "none",
  transition: "border-color var(--dur-base), box-shadow var(--dur-base)",
  boxSizing: "border-box" as const,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--color-text-secondary)",
  fontSize: "var(--fs-base)",
  fontWeight: 500,
  marginBottom: "var(--space-6)",
  letterSpacing: "0.02em",
};

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifySent, setVerifySent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Registration failed");
      } else {
        setVerifySent(true);
      }
    } catch (err) {
      console.error("Register error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--color-accent)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
  };

  const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
    e.currentTarget.style.boxShadow = "none";
  };

  if (verifySent) {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: "var(--fs-6xl)",
            marginBottom: "var(--space-16)",
          }}
        >
          ✉️
        </div>
        <h2
          style={{
            fontSize: "var(--fs-2xl)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-8)",
          }}
        >
          Check your email
        </h2>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "var(--fs-lg)",
            lineHeight: 1.6,
          }}
        >
          We sent a verification link to <strong>{email}</strong>. Click it to activate your account
          and start using PKGVault.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "var(--space-20)" }}>
        <label htmlFor="reg-name" style={labelStyle}>
          Display Name
        </label>
        <input
          id="reg-name"
          type="text"
          placeholder="Your username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={100}
          autoComplete="username"
          style={inputStyle}
          onFocus={focusHandler}
          onBlur={blurHandler}
        />
      </div>

      <div style={{ marginBottom: "var(--space-20)" }}>
        <label htmlFor="reg-email" style={labelStyle}>
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={inputStyle}
          onFocus={focusHandler}
          onBlur={blurHandler}
        />
      </div>

      <div style={{ marginBottom: "var(--space-20)" }}>
        <label htmlFor="reg-password" style={labelStyle}>
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          style={inputStyle}
          onFocus={focusHandler}
          onBlur={blurHandler}
        />
      </div>

      <div style={{ marginBottom: "var(--space-24)" }}>
        <label htmlFor="reg-confirm" style={labelStyle}>
          Confirm Password
        </label>
        <input
          id="reg-confirm"
          type="password"
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          style={inputStyle}
          onFocus={focusHandler}
          onBlur={blurHandler}
        />
      </div>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-xs)",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "var(--color-danger-soft)",
            fontSize: "var(--fs-md)",
            marginBottom: "var(--space-16)",
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
          borderRadius: "var(--radius-sm)",
          border: "none",
          background: loading
            ? "rgba(99, 102, 241, 0.5)"
            : "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff",
          fontSize: "var(--fs-lg)",
          fontWeight: 600,
          fontFamily: "var(--font-sans)",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "transform var(--dur-fast), box-shadow var(--dur-fast)",
          boxShadow: "0 4px 20px rgba(99, 102, 241, 0.3)",
        }}
      >
        {loading ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
