// Load environment variables
import { config } from "dotenv";
import { resolve } from "path";
import { cwd } from "process";

// Load .env file from project root
const envPath = resolve(cwd(), ".env");
const result = config({ path: envPath, override: true });

if (result.error) {
  console.error(`[drizzle] Error loading .env: ${result.error.message}`);
} else {
  console.log(`[drizzle] Loaded .env from ${envPath}`);
}

import { defineConfig } from "drizzle-kit";

// Get and validate DATABASE_URL
let dbUrl = process.env.DATABASE_URL?.trim() || '';

// Remove quotes if present
if ((dbUrl.startsWith('"') && dbUrl.endsWith('"')) || (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
  dbUrl = dbUrl.slice(1, -1).trim();
}

if (!dbUrl || dbUrl === 'postgresql://user:password@host:port/database') {
  console.error(`[drizzle] DATABASE_URL is not set or is placeholder value`);
  console.error(`[drizzle] Current value: ${dbUrl.substring(0, 50)}...`);
  throw new Error("DATABASE_URL must be set to a valid database URL. Check your .env file.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
