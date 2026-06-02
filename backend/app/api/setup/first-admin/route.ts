import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const existingAdmin = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  if (existingAdmin.length > 0) {
    return NextResponse.json({ error: "Admin already exists" }, { status: 400 });
  }

  await db.update(users).set({ role: "admin" }).where(eq(users.id, session.user.id));

  return NextResponse.json({ message: "You are now admin" });
}
