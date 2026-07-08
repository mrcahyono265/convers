import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("[FATAL] DATABASE_URL is not set. Create a .env file with DATABASE_URL or set the environment variable.");
  process.exit(1);
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: dbUrl,
  },
});
