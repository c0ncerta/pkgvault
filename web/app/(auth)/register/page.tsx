import { GlassCard } from "@/components/liquid/glass";
import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

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
          fontSize: "var(--fs-4xl)",
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
          fontSize: "var(--fs-lg)",
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
          fontSize: "var(--fs-md)",
        }}
      >
        Already have an account?{" "}
        <a href="/login" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 500 }}>
          Sign in
        </a>
      </p>
    </GlassCard>
  );
}
