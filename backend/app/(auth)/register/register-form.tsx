"use client";

import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 10,
  border: "1px solid rgba(255, 255, 255, 0.1)",
  background: "rgba(255, 255, 255, 0.04)",
  color: "#e0e0e0",
  fontSize: "0.95rem",
  fontFamily: "var(--font-sans)",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box" as const,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--color-text-secondary)",
  fontSize: "0.8rem",
  fontWeight: 500,
  marginBottom: 6,
  letterSpacing: "0.02em",
};

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#6366f1";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
  };

  const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 20 }}>
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

      <div style={{ marginBottom: 20 }}>
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

      <div style={{ marginBottom: 20 }}>
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

      <div style={{ marginBottom: 24 }}>
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
        {loading ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
