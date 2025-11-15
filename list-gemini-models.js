// Script to list available Gemini models
import { GoogleGenerativeAI } from "@google/generative-ai";
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

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("❌ No API key found!");
  process.exit(1);
}

try {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try to list models (if API supports it)
  console.log("=== Testing Different Model Names ===\n");
  
  const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
    "gemini-pro",
    "gemini-pro-latest"
  ];
  
  for (const modelName of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'test'");
      const response = result.response.text();
      console.log(`✅ ${modelName}: WORKING - "${response}"`);
      break; // Found working model
    } catch (error) {
      console.log(`❌ ${modelName}: ${error.message.split('\n')[0]}`);
    }
  }
} catch (error) {
  console.error("Error:", error.message);
}

