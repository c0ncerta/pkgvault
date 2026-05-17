import { readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

const dbUrl =
  process.env.DATABASE_URL ?? "postgresql://pkgvault:pkgvault_dev@localhost:5432/pkgvault";
const sql = postgres(dbUrl);

async function migrate() {
  const dirname =
    typeof import.meta.dirname === "string"
      ? import.meta.dirname
      : new URL(".", import.meta.url).pathname;
  const migrationSql = readFileSync(
    join(dirname, "..", "db", "migrations", "add_sources.sql"),
    "utf-8",
  );

  try {
    await sql.unsafe(migrationSql);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("already exists")) {
      // Tables already exist, skip
    } else {
      console.error("Migration failed:", message);
      process.exit(1);
    }
  }

  // Verify tables exist
  const _tables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('pkg_sources', 'link_reports')
    ORDER BY table_name
  `;

  // Check r2_key is nullable
  const _r2Col = await sql`
    SELECT is_nullable FROM information_schema.columns 
    WHERE table_name = 'pkg_files' AND column_name = 'r2_key'
  `;

  await sql.end();
}

migrate();
