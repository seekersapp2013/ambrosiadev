#!/usr/bin/env node

import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.CONVEX_URL);

async function runMigration() {
  try {
    console.log("Running migration to set existing content as public...");
    
    const result = await client.mutation("migrations/setExistingContentPublic:setExistingContentPublic", {});
    
    console.log("Migration completed successfully:", result);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();