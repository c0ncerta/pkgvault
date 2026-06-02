import postgres from "postgres";

const sql = postgres("postgresql://pkgvault:pkgvault_dev@localhost:5432/pkgvault", {
  connect_timeout: 5,
});

async function main() {
  try {
    const _result = await sql`SELECT 1 as ok`;
    console.info("Database connection successful");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Database connection failed:", message);
  } finally {
    await sql.end();
  }
}

main();
