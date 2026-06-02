import { GlassCard } from "@/components/liquid/glass";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your PKGVault account",
};

export default function LoginPage() {
  return (
    <GlassCard
      variant="elevated"
      cornerRadius={16}
      padding="32px"
      style={{ width: "100%", maxWidth: 420 }}
    >
      <h1
        style={{
          fontSize: "var(--fs-4xl)",
          fontWeight: 800,
          color: "var(--color-text-primary)",
          marginBottom: 8,
          textAlign: "center",
          letterSpacing: "-0.02em",
        }}
      >
        Welcome back
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          textAlign: "center",
          marginBottom: 32,
          fontSize: "var(--fs-lg)",
        }}
      >
        Sign in to your PKGVault account
      </p>
      <LoginForm />
      <p
        style={{
          color: "var(--color-text-faint)",
          textAlign: "center",
          marginTop: 24,
          fontSize: "var(--fs-md)",
        }}
      >
        Don&apos;t have an account?{" "}
        <a
          href="/register"
          style={{ color: "var(--color-accent-hover)", textDecoration: "none", fontWeight: 500 }}
        >
          Create one
        </a>
      </p>
    </GlassCard>
  );
}
