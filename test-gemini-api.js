// Quick test script to verify Gemini API integration
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables - try multiple paths
const envPaths = [
  resolve(process.cwd(), ".env"),
  resolve(__dirname, ".env"),
  resolve(__dirname, "..", ".env")
];

let envLoaded = false;
for (const envPath of envPaths) {
  const result = config({ path: envPath });
  if (!result.error) {
    envLoaded = true;
    break;
  }
}

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

console.log("=== Gemini API Integration Test ===\n");

if (!apiKey) {
  console.error("❌ ERROR: No API key found!");
  console.error("   Please set GEMINI_API_KEY in your .env file");
  process.exit(1);
}

console.log("✅ API Key found:", apiKey.substring(0, 20) + "...");
console.log("");

try {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 100,
    }
  });

  console.log("🔄 Testing API connection...");
  const result = await model.generateContent("Say 'Hello! Gemini API is working!' in one sentence.");
  const response = result.response.text();
  
  console.log("✅ API Response:", response);
  console.log("\n🎉 SUCCESS! Gemini API is integrated and working!");
} catch (error) {
  console.error("❌ ERROR:", error.message);
  console.error("\nTroubleshooting:");
  console.error("1. Check if your API key is correct");
  console.error("2. Verify internet connection");
  console.error("3. Check Gemini API quota/limits");
  process.exit(1);
}

