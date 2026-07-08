import postgres from 'postgres';
import { env } from './src/config/env';

// Connect to default 'postgres' database to create the new one
if (!env.DATABASE_URL) {
  console.error("[FATAL] DATABASE_URL is required");
  process.exit(1);
}
const defaultUrl = env.DATABASE_URL.replace('/english_companion', '/postgres');
const sql = postgres(defaultUrl);

async function run() {
  try {
    await sql`CREATE DATABASE english_companion`;
    console.log("Database english_companion created successfully.");
  } catch (err) {
    console.error("Error creating database (maybe it already exists?):", err);
  }
  process.exit(0);
}

run();
