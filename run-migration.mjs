#!/usr/bin/env node

import { ConvexHttpClient } from "convex/browser";
import { internal } from "./convex/_generated/api.js";
import { readFileSync } from "fs";

// Read environment variables from .env.local
function loadEnvFile() {
  try {
    const envContent = readFileSync('.env.local', 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    }
  } catch (error) {
    console.log("Could not read .env.local file, using environment variables");
  }
}

// Load environment variables
loadEnvFile();

const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ CONVEX_URL environment variable is required");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function runMigration() {
  console.log("🚀 Starting multi-currency wallet migration...");
  
  try {
    // Step 1: Initialize currency metadata
    console.log("\n📊 Initializing currency metadata...");
    const metadataResult = await client.mutation(internal.migrations.migrateToMultiCurrency.initializeCurrencyMetadata, {});
    console.log(`✅ Currency metadata: ${metadataResult.insertedCount} inserted, ${metadataResult.skippedCount} skipped`);

    // Step 2: Migrate wallets in batches
    console.log("\n💰 Migrating wallets to multi-currency structure...");
    let totalMigrated = 0;
    let totalErrors = 0;
    let hasMore = true;
    let batchNumber = 1;

    while (hasMore) {
      console.log(`\n🔄 Running migration batch ${batchNumber}...`);
      
      const result = await client.mutation(internal.migrations.migrateToMultiCurrency.migrateWalletsToMultiCurrency, {
        batchSize: 50
      });

      if (!result.success) {
        console.error(`❌ Batch ${batchNumber} failed:`, result.errors);
        break;
      }

      totalMigrated += result.migratedCount;
      totalErrors += result.errorCount;
      hasMore = result.hasMore;

      console.log(`✅ Batch ${batchNumber}: ${result.migratedCount} migrated, ${result.errorCount} errors`);
      
      if (result.errors.length > 0) {
        console.log("⚠️  Errors in this batch:");
        result.errors.forEach(error => console.log(`   - ${error}`));
      }

      batchNumber++;
      
      // Prevent infinite loops
      if (batchNumber > 100) {
        console.log("⚠️  Stopping after 100 batches to prevent infinite loop");
        break;
      }
    }

    // Step 3: Validate migration
    console.log("\n🔍 Validating migration results...");
    const validation = await client.mutation(internal.migrations.migrateToMultiCurrency.validateMigration, {});
    
    if (validation.success) {
      console.log(`✅ Validation complete:`);
      console.log(`   - Old structure wallets: ${validation.oldStructureCount}`);
      console.log(`   - New structure wallets: ${validation.newStructureCount}`);
      console.log(`   - Migration complete: ${validation.isComplete ? 'YES' : 'NO'}`);
      
      if (validation.validationErrors.length > 0) {
        console.log("⚠️  Validation errors:");
        validation.validationErrors.forEach(error => console.log(`   - ${error}`));
      }
    } else {
      console.error("❌ Validation failed:", validation.error);
    }

    // Summary
    console.log("\n📋 Migration Summary:");
    console.log(`   - Total wallets migrated: ${totalMigrated}`);
    console.log(`   - Total errors: ${totalErrors}`);
    console.log(`   - Migration ${validation.isComplete ? 'COMPLETED' : 'INCOMPLETE'}`);

    if (validation.isComplete && totalErrors === 0) {
      console.log("\n🎉 Migration completed successfully!");
    } else if (totalErrors > 0) {
      console.log("\n⚠️  Migration completed with errors. Please review the error messages above.");
    } else {
      console.log("\n⚠️  Migration incomplete. Some wallets may still need migration.");
    }

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
runMigration().catch(console.error);