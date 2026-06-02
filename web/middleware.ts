import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/profile", "/settings", "/upload", "/api/pkg", "/api/forum"];

// Routes that require mod or admin role
const modRoutes = ["/admin", "/api/admin"];

// Routes that require admin role
const adminRoutes = ["/api/admin/users"];

// Auth pages that logged-in users should not see
const authPages = ["/login", "/register"];

/**
 * Build a strict, per-request Content-Security-Policy.
 *
 * script-src uses a fresh nonce + 'strict-dynamic' (no 'unsafe-inline'): Next.js
 * picks up the nonce from the request CSP header and stamps it on its own inline
 * bootstrap scripts, which then transitively trust the chunk files.
 *
 * style-src keeps 'unsafe-inline' because the app relies on inline `style={...}`
 * attributes throughout — nonces only cover <style> elements, not style attributes.
 */
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Per-request nonce for the script CSP (Edge- and Node-safe primitives).
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  // Forward the nonce + CSP on the request so Next.js can nonce its inline scripts.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const setCsp = (res: NextResponse) => {
    res.headers.set("content-security-policy", csp);
    return res;
  };
  const nextResponse = () => setCsp(NextResponse.next({ request: { headers: requestHeaders } }));

  // Skip auth check for public routes (but still apply the CSP).
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isMod = modRoutes.some((route) => pathname.startsWith(route));
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));
  const isAuthPage = authPages.some((route) => pathname === route);

  if (!isProtected && !isMod && !isAdmin && !isAuthPage) {
    return nextResponse();
  }

  // Get session from Better-Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Logged-in users should not see login/register pages
  if (session && isAuthPage) {
    return setCsp(NextResponse.redirect(new URL("/", request.url)));
  }

  // Not authenticated → redirect to login (pages) or 401 (API)
  if (!session) {
    if (isAuthPage) {
      return nextResponse();
    }
    if (pathname.startsWith("/api/")) {
      return setCsp(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return setCsp(NextResponse.redirect(loginUrl));
  }

  // Role checks
  const userRole = (session.user as { role?: string }).role ?? "user";

  if (isMod && userRole !== "mod" && userRole !== "admin") {
    if (pathname.startsWith("/api/")) {
      return setCsp(
        NextResponse.json({ error: "Forbidden: moderator access required" }, { status: 403 }),
      );
    }
    return setCsp(NextResponse.redirect(new URL("/", request.url)));
  }

  if (isAdmin && userRole !== "admin") {
    if (pathname.startsWith("/api/")) {
      return setCsp(
        NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 }),
      );
    }
    return setCsp(NextResponse.redirect(new URL("/", request.url)));
  }

  return nextResponse();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
