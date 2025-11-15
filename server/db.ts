// Load environment variables FIRST, before anything else
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { cwd } from "process";

// Try multiple paths to find .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathsToTry = [
  resolve(cwd(), ".env"), // Current working directory (most reliable)
  resolve(__dirname, "..", "..", ".env"), // Two levels up from server/db.ts
  resolve(__dirname, "..", ".env"), // One level up from server
];

let envPath: string | undefined;
let result: any;

for (const path of pathsToTry) {
  try {
    result = config({ path, override: true });
    if (!result.error) {
      envPath = path;
      break;
    }
  } catch (e) {
    // Try next path
    continue;
  }
}

if (result?.error || !envPath) {
  console.error(`[dotenv] Error: Could not load .env file. Tried paths:`, pathsToTry);
  console.error(`[dotenv] Current working directory: ${cwd()}`);
} else {
  const varCount = Object.keys(result.parsed || {}).length;
  console.log(`[dotenv] ✅ Loaded .env from ${envPath}, found ${varCount} variables`);
  if (varCount === 0) {
    console.warn(`[dotenv] ⚠️  Warning: .env file found but contains 0 variables. Check file format.`);
  }
}

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("\n❌ ERROR: DATABASE_URL environment variable is not set!\n");
  console.error("To fix this:");
  console.error("  1. Create a .env file in the project root");
  console.error("  2. Add: DATABASE_URL=postgresql://user:password@host:port/database");
  console.error("  3. Or run: npm run setup (if available)");
  console.error("\nQuick setup options:");
  console.error("  • Neon (Free): https://neon.tech");
  console.error("  • Local PostgreSQL: postgresql://postgres:password@localhost:5432/database");
  console.error("\nFor detailed instructions, see: README-SETUP.md or RUN-COMMANDS.md\n");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Validate DATABASE_URL format
let dbUrl = process.env.DATABASE_URL?.trim() || '';
// Remove quotes if present (common mistake)
if ((dbUrl.startsWith('"') && dbUrl.endsWith('"')) || (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
  dbUrl = dbUrl.slice(1, -1).trim();
}

// Debug: Log what we're getting (first 50 chars only for security)
if (process.env.NODE_ENV === 'development') {
  console.log(`[DEBUG] DATABASE_URL length: ${dbUrl.length}, starts with: ${dbUrl.substring(0, 20)}...`);
}

try {
  // For URLs with query parameters, we need to handle them properly
  // Split on '?' to separate base URL from query params
  const [baseUrl, queryString] = dbUrl.split('?');
  const url = new URL(baseUrl);
  
  if (!url.protocol.startsWith('postgres')) {
    throw new Error('Invalid protocol. Must start with postgresql:// or postgres://');
  }
  if (!url.hostname || !url.pathname || url.pathname === '/') {
    throw new Error('Invalid URL format. Missing hostname or database name');
  }
  
  // Reconstruct full URL with query params if they exist
  if (queryString) {
    dbUrl = `${url.toString()}?${queryString}`;
  } else {
    dbUrl = url.toString();
  }
} catch (error: any) {
  console.error("\n❌ ERROR: Invalid DATABASE_URL format!\n");
  console.error(`Error: ${error.message}`);
  console.error(`Your DATABASE_URL (first 80 chars): ${dbUrl.substring(0, 80)}${dbUrl.length > 80 ? '...' : ''}`);
  console.error(`Full DATABASE_URL length: ${dbUrl.length} characters`);
  console.error("\nCorrect format examples:");
  console.error("  • Neon: postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname");
  console.error("  • Local: postgresql://postgres:password@localhost:5432/database");
  console.error("\nCommon issues:");
  console.error("  • Remove quotes around the URL in .env file");
  console.error("  • Special characters in password must be URL-encoded (e.g., @ becomes %40)");
  console.error("  • No spaces before or after the URL");
  console.error("  • Must start with postgresql:// or postgres://");
  console.error("\nFix your .env file and try again.\n");
  throw new Error(`Invalid DATABASE_URL format: ${error.message}`);
}

export const pool = new Pool({ connectionString: dbUrl });
export const db = drizzle({ client: pool, schema });
