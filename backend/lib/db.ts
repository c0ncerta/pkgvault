import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";

// Connection string from env
const connectionString = process.env["DATABASE_URL"];
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// For query execution — use pool mode
const queryClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Drizzle ORM instance with full schema for relational queries
export const db = drizzle(queryClient, { schema });

// Export raw client for migrations or raw SQL
export { queryClient };
