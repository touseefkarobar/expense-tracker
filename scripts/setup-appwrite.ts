import "dotenv/config";

import { ensureAppwriteDatabase } from "../lib/server/ensure-database";

async function main() {
  try {
    console.log("Ensuring Appwrite database schema...");
    await ensureAppwriteDatabase();
    console.log("Appwrite database schema is up to date.");
  } catch (error) {
    console.error("Failed to ensure Appwrite database schema:");
    console.error(error);
    process.exit(1);
  }
}

void main();
