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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for public routes
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isMod = modRoutes.some((route) => pathname.startsWith(route));
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));
  const isAuthPage = authPages.some((route) => pathname === route);

  if (!isProtected && !isMod && !isAdmin && !isAuthPage) {
    return NextResponse.next();
  }

  // Get session from Better-Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Logged-in users should not see login/register pages
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Not authenticated → redirect to login (pages) or 401 (API)
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role checks
  const userRole = (session.user as { role?: string }).role ?? "user";

  if (isMod && userRole !== "mod" && userRole !== "admin") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden: moderator access required" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdmin && userRole !== "admin") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
