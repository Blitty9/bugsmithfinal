import * as path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

console.log("[ENV] Loaded .env.local");

if (!process.env.OPENAI_KEY) {
  console.error("[ERROR] Missing OPENAI_KEY in .env.local");
}

console.log("[DEBUG] OpenAI key loaded:", !!process.env.OPENAI_KEY);
console.log("[DEBUG] OpenAI key length:", process.env.OPENAI_KEY?.length || 0);

