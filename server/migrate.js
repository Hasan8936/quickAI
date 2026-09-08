// Run once to create RAG tables in your Neon database:
//   node migrate.js
// Make sure DATABASE_URL is set in server/.env (or as an env var)

import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

config(); // load .env

const __dir = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set. Add it to server/.env and retry.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const migrationSQL = readFileSync(
  join(__dir, "migrations", "001_create_rag_tables.sql"),
  "utf8"
);

// Split on semicolons so each statement runs individually
const statements = migrationSQL
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`🚀  Running ${statements.length} statements…`);

for (const stmt of statements) {
  try {
    await sql.unsafe(stmt);
    // Print first 60 chars of each statement for visibility
    console.log(`  ✅  ${stmt.slice(0, 70).replace(/\n/g, " ")}…`);
  } catch (err) {
    console.error(`  ❌  Failed on: ${stmt.slice(0, 70)}…`);
    console.error(`      ${err.message}`);
    process.exit(1);
  }
}

console.log("\n✅  Migration complete — all RAG tables created.");
