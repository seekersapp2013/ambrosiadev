#!/usr/bin/env node

/**
 * Migration Script: Approve All Existing Content
 * 
 * This script approves all existing content in the database to ensure
 * backward compatibility with the new moderation system.
 * 
 * Usage: node run-approve-migration.mjs
 */

import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: CONVEX_URL not found in environment variables");
  console.error("Please set VITE_CONVEX_URL or NEXT_PUBLIC_CONVEX_URL");
  process.exit(1);
}

console.log("🚀 Starting migration: Approve All Existing Content");
console.log("📡 Connecting to:", CONVEX_URL);

const client = new ConvexHttpClient(CONVEX_URL);

try {
  console.log("⏳ Running migration...");
  
  const result = await client.mutation("migrations/approveAllExistingContent:approveAllExistingContent");
  
  console.log("\n✅ Migration completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   Articles updated: ${result.articlesUpdated}`);
  console.log(`   Reels updated: ${result.reelsUpdated}`);
  console.log(`   Circles updated: ${result.circlesUpdated}`);
  console.log(`   Expert Requests updated: ${result.expertRequestsUpdated}`);
  console.log(`   Booking Subscribers updated: ${result.bookingSubscribersUpdated}`);
  console.log(`   Total items updated: ${result.totalUpdated}`);
  
  if (result.totalUpdated === 0) {
    console.log("\n✨ All content was already approved. No changes needed.");
  } else {
    console.log("\n✨ All existing content has been approved and will now appear in feeds.");
  }
  
  process.exit(0);
} catch (error) {
  console.error("\n❌ Migration failed:", error.message);
  console.error("\nFull error:", error);
  process.exit(1);
}
