// Direct test using REST API to see available models
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

console.log("=== Testing Gemini API with Different Models ===\n");
console.log("API Key:", apiKey.substring(0, 20) + "...\n");

// Try different model names that might work
const modelsToTest = [
  "gemini-1.5-flash",
  "gemini-1.5-pro", 
  "gemini-pro",
  "models/gemini-1.5-flash",
  "models/gemini-1.5-pro",
  "models/gemini-pro"
];

for (const modelName of modelsToTest) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Say 'test' in one word"
          }]
        }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Success but no text";
      console.log(`✅ ${modelName}: WORKING - "${text}"`);
      console.log(`\n🎉 Use this model: ${modelName}\n`);
      process.exit(0);
    } else {
      const error = await response.text();
      console.log(`❌ ${modelName}: ${response.status} - ${error.substring(0, 100)}`);
    }
  } catch (error) {
    console.log(`❌ ${modelName}: ${error.message}`);
  }
}

console.log("\n⚠️  None of the models worked. Please check:");
console.log("1. API is enabled in Google Cloud Console");
console.log("2. API key has correct permissions");
console.log("3. Billing is set up (free tier available)");

