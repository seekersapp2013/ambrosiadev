#!/usr/bin/env node

/**
 * Script to approve all pending content
 * This will set all PENDING content to APPROVED so it shows in feeds
 * 
 * Usage: node approve-all-content.mjs
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function main() {
  console.log('🚀 Approving all pending content...\n');
  
  try {
    // Run the migration
    const { stdout, stderr } = await execAsync('npx convex run migrations/approveAllExistingContent:run');
    
    if (stderr) {
      console.error('⚠️  Warnings:', stderr);
    }
    
    console.log(stdout);
    console.log('\n✅ Content approval complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Check your Learn tab - all content should now be visible');
    console.log('   2. To disable approval requirements, go to Admin Dashboard > Moderation Settings');
    console.log('   3. Or keep moderation enabled and approve content manually from the Moderation Queue\n');
    
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    console.error('\n💡 Make sure you have:');
    console.error('   1. Convex CLI installed (npm install -g convex)');
    console.error('   2. Convex project configured (npx convex dev)');
    console.error('   3. Valid authentication credentials\n');
    process.exit(1);
  }
}

main();
