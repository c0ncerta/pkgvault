import type { NextConfig } from "next";

// Static security headers (applied to every response).
// The Content-Security-Policy is intentionally NOT set here: it carries a
// per-request nonce and is generated in middleware.ts. Keeping it out of here
// avoids emitting a second, conflicting CSP header.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  // Standalone output for Docker deployments
  output: "standalone",

  // Enable React strict mode for better dev-time error detection
  reactStrictMode: true,

  // Server external packages that shouldn't be bundled
  serverExternalPackages: ["postgres", "ioredis"],

  // Image optimization config (R2 / external domains)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
    ],
  },

  // Security headers applied to every response.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
