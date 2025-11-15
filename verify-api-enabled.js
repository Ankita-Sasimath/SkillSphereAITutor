// Simple script to verify if Gemini API is enabled
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPaths = [
  resolve(process.cwd(), ".env"),
  resolve(__dirname, ".env"),
  resolve(__dirname, "..", ".env")
];

for (const envPath of envPaths) {
  const result = config({ path: envPath });
  if (!result.error) break;
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ No API key found!");
  process.exit(1);
}

console.log("=== Verifying Gemini API Access ===\n");
console.log("API Key:", apiKey.substring(0, 20) + "...\n");

// Try to list available models - this will tell us if API is enabled
try {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  console.log("Fetching available models...\n");
  
  const response = await fetch(url);
  
  if (response.status === 200) {
    const data = await response.json();
    const models = data.models || [];
    
    if (models.length > 0) {
      console.log("✅ API IS ENABLED! Available models:\n");
      models.slice(0, 10).forEach(model => {
        console.log(`  - ${model.name}`);
      });
      console.log(`\n🎉 Use one of these model names in your code!`);
    } else {
      console.log("⚠️  API responded but no models found");
    }
  } else if (response.status === 403) {
    console.log("❌ 403 Forbidden - API is NOT enabled or key has no permissions");
    console.log("\nFix:");
    console.log("1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com");
    console.log("2. Click 'Enable'");
    console.log("3. Wait 2-3 minutes and try again");
  } else if (response.status === 401) {
    console.log("❌ 401 Unauthorized - Invalid API key");
    console.log("\nFix: Check your API key is correct");
  } else {
    const errorText = await response.text();
    console.log(`❌ Error ${response.status}: ${errorText.substring(0, 200)}`);
  }
} catch (error) {
  console.error("❌ Network error:", error.message);
}

