import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
