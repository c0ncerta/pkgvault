import type { Metadata } from "next";
import { AddPkgForm } from "./add-pkg-form";

export const metadata: Metadata = { title: "Add PKG" };

export default function AddPkgPage() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: "var(--fs-base)", color: "#475569", marginBottom: 12 }}>
          <a href="/admin/pkgs" style={{ color: "#818cf8", textDecoration: "none" }}>
            PKG Manager
          </a>
          <span style={{ margin: "0 8px" }}>›</span>
          <span>Add PKG</span>
        </div>
        <h1
          style={{
            fontSize: "var(--fs-3xl)",
            fontWeight: 800,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.03em",
            marginBottom: 4,
          }}
        >
          Add PKG Entry
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--fs-md)" }}>
          Register a new package with metadata and download sources.
        </p>
      </div>
      <AddPkgForm />
    </div>
  );
}
