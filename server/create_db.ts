import postgres from 'postgres';
import { config } from 'dotenv';
config();

// Connect to default 'postgres' database to create the new one
const defaultUrl = process.env.DATABASE_URL!.replace('/english_companion', '/postgres');
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
