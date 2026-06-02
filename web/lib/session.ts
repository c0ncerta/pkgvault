import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Get the current session on the server side.
 * Use in Server Components and API routes.
 */
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Require an authenticated session, throw if not found.
 */
export async function requireSession() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Require a specific role.
 */
export async function requireRole(role: "user" | "mod" | "admin") {
  const session = await requireSession();
  const userRole = (session.user as { role?: string }).role ?? "user";

  const roleHierarchy = { user: 0, mod: 1, admin: 2 };
  if ((roleHierarchy[userRole as keyof typeof roleHierarchy] ?? 0) < roleHierarchy[role]) {
    throw new Error("Forbidden");
  }

  return session;
}
