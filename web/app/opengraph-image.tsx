import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PKGVault — Community PKG Archive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Decorative orbs */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -40,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
        }}
      />

      {/* Logo / Icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 96,
          height: 96,
          borderRadius: 24,
          background: "linear-gradient(135deg, #6366f1, #a855f7)",
          marginBottom: 32,
          fontSize: "var(--fs-7xl)",
        }}
      >
        PKG
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: "var(--fs-display)",
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "-0.02em",
          marginBottom: 16,
        }}
      >
        PKGVault
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: "var(--fs-4xl)",
          color: "rgba(255,255,255,0.6)",
          maxWidth: 700,
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        Community-driven PKG file archive — browse, upload &amp; verify game packages
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          display: "flex",
          gap: 32,
          fontSize: "var(--fs-2xl)",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        <span>✓ SHA-256 Verified</span>
        <span>•</span>
        <span>☁ R2 Storage</span>
        <span>•</span>
        <span>✆ Community Moderated</span>
      </div>
    </div>,
    { ...size },
  );
}
