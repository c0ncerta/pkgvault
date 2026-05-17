/**
 * Create an admin user for testing.
 *
 * Usage:
 *   npx dotenv-cli -e .env -- npx tsx db/create-admin.ts
 *
 * This will:
 *  1. Hash the password with bcrypt (same as Better-Auth)
 *  2. Insert user + account directly into the database
 *  3. Set the user role to admin
 */
import "dotenv/config";
import { db } from "@/lib/db";
import { users, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "admin@pkgvault.local";
const ADMIN_PASSWORD = "admin1234";
const ADMIN_NAME = "Admin";

async function hashPassword(password: string): Promise<string> {
  // Better-Auth by default uses standard bcrypt hashing
  return bcrypt.hash(password, 10);
}

async function createAdmin() {
  console.log("Creating admin user...");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log();

  // Check if user already exists
  const [existing] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);

  if (existing) {
    // Just promote to admin and update password to bcrypt
    const hashedPassword = await hashPassword(ADMIN_PASSWORD);
    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.email, ADMIN_EMAIL));
    await db
      .update(accounts)
      .set({ password: hashedPassword })
      .where(eq(accounts.userId, existing.id));
      
    console.log(`  User already exists (id: ${existing.id}) — promoted to admin & updated password.`);
    console.log();
    console.log("Admin user ready!");
    console.log("  Login at: http://localhost:3000/login");
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    process.exit(0);
  }

  // Hash password
  const hashedPassword = await hashPassword(ADMIN_PASSWORD);
  const userId = randomUUID();

  // Insert user
  await db.insert(users).values({
    id: userId,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    role: "admin",
  });

  // Insert account (Better-Auth credential provider)
  await db.insert(accounts).values({
    id: crypto.randomUUID(),
    userId,
    accountId: userId,
    providerId: "credential",
    password: hashedPassword,
  });

  console.log(`  User created (id: ${userId})`);
  console.log(`  Role: admin`);
  console.log();
  console.log("Admin user ready!");
  console.log("  Login at: http://localhost:3000/login");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
