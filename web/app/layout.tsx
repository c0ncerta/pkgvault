import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AmbientOrbs } from "@/components/liquid/ambient-orbs";
import { Providers } from "./providers";

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
  weight: ["400", "500", "600", "700"],
});

function getMetadataBase() {
  const configuredUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? process.env["BETTER_AUTH_URL"];
  try {
    return new URL(configuredUrl ?? "https://pkgvault.fun");
  } catch {
    return new URL("https://pkgvault.fun");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "PKGVault",
    template: "%s | PKGVault",
  },
  description:
    "Community-driven PKG file archive — browse, upload, and discuss game packages with integrity verification.",
  keywords: ["PKG", "archive", "games", "community", "vault"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PKGVault",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased bg-liquid-glow">
        <AmbientOrbs />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
