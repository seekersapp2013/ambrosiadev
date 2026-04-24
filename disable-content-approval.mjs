#!/usr/bin/env node

/**
 * Script to disable content approval requirements
 * This will allow all new content to be published immediately without approval
 * 
 * Usage: node disable-content-approval.mjs
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function disableApproval() {
  console.log('🔧 Disabling content approval requirements...\n');
  
  try {
    // First, approve all existing pending content
    console.log('Step 1: Approving all existing pending content...');
    const { stdout: approveOutput } = await execAsync('npx convex run migrations/approveAllExistingContent:run');
    console.log(approveOutput);
    
    // Then, disable approval requirements
    console.log('\nStep 2: Disabling approval requirements for new content...');
    const updateCommand = `npx convex run moderationSettings:updateModerationSettings '{"articlesRequireApproval":false,"reelsRequireApproval":false}'`;
    const { stdout: updateOutput } = await execAsync(updateCommand);
    console.log(updateOutput);
    
    console.log('\n✅ Content approval disabled successfully!');
    console.log('\n📝 What this means:');
    console.log('   ✓ All existing content is now approved and visible');
    console.log('   ✓ New articles and reels will be published immediately');
    console.log('   ✓ No manual approval needed for content');
    console.log('\n💡 To re-enable moderation:');
    console.log('   Go to Admin Dashboard > Moderation Settings\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Make sure you have:');
    console.error('   1. Convex CLI installed (npm install -g convex)');
    console.error('   2. Convex project running (npx convex dev)');
    console.error('   3. Valid authentication credentials\n');
    process.exit(1);
  }
}

disableApproval();
