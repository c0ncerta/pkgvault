import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

const sql = postgres(process.env['DATABASE_URL'] || "postgresql://pkgvault:pkgvault_dev@localhost:5432/pkgvault");

async function migrate() {
  console.log("🔄 Running sources migration...");

  const migrationSql = readFileSync(
    join(import.meta.dirname!, "..", "db", "migrations", "add_sources.sql"),
    "utf-8"
  );

  try {
    await sql.unsafe(migrationSql);
    console.log("✅ Migration complete — pkg_sources + link_reports tables created");
  } catch (e: any) {
    if (e.message?.includes("already exists")) {
      console.log("ℹ️  Tables already exist, skipping");
    } else {
      console.error("❌ Migration failed:", e.message);
      process.exit(1);
    }
  }

  // Verify tables exist
  const tables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('pkg_sources', 'link_reports')
    ORDER BY table_name
  `;
  console.log("📋 Tables verified:", tables.map(t => t['table_name']).join(", "));

  // Check r2_key is nullable
  const r2Col = await sql`
    SELECT is_nullable FROM information_schema.columns 
    WHERE table_name = 'pkg_files' AND column_name = 'r2_key'
  `;
  console.log("📋 r2_key nullable:", r2Col[0]?.['is_nullable'] === "YES" ? "✅ yes" : "❌ no");

  await sql.end();
  console.log("🎉 Done!");
}

migrate();
