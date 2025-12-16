import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY.trim().length === 0) {
  console.error("Missing PRIVATE_KEY in .env");
  process.exit(1);
}

console.log("✅ .env looks OK (PRIVATE_KEY present).");
