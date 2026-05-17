import type { Metadata } from "next";
import { RegisterForm } from "./register-form";
import { GlassCard } from "@/components/liquid/glass";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your PKGVault account",
};

export default function RegisterPage() {
  return (
    <GlassCard
      variant="elevated"
      cornerRadius={16}
      padding="32px"
      style={{ width: "100%", maxWidth: 420 }}
    >
      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: 800,
          color: "var(--color-text-primary)",
          marginBottom: 8,
          textAlign: "center",
          letterSpacing: "-0.02em",
        }}
      >
        Create account
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          textAlign: "center",
          marginBottom: 32,
          fontSize: "0.9rem",
        }}
      >
        Join the PKGVault community
      </p>
      <RegisterForm />
      <p
        style={{
          color: "#475569",
          textAlign: "center",
          marginTop: 24,
          fontSize: "0.85rem",
        }}
      >
        Already have an account?{" "}
        <a
          href="/login"
          style={{ color: "#818cf8", textDecoration: "none", fontWeight: 500 }}
        >
          Sign in
        </a>
      </p>
    </GlassCard>
  );
}
