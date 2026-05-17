import postgres from "postgres";

const sql = postgres("postgresql://pkgvault:pkgvault_dev@localhost:5432/pkgvault", {
  connect_timeout: 5,
});

async function main() {
  try {
    const result = await sql`SELECT 1 as ok`;
    console.log("DB OK:", JSON.stringify(result));
  } catch (e: any) {
    console.error("DB ERROR:", e.code, e.message);
  } finally {
    await sql.end();
  }
}

main();
