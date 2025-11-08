#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔧 Setting up LiveKit environment variables for Convex...');

try {
  // Read .env.local file
  const envPath = join(process.cwd(), '.env.local');
  const envContent = readFileSync(envPath, 'utf8');
  
  // Parse environment variables
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      envVars[key] = value;
    }
  });

  // Set LiveKit environment variables in Convex
  const livekitVars = ['LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET', 'LIVEKIT_WS_URL'];
  
  for (const varName of livekitVars) {
    if (envVars[varName]) {
      console.log(`Setting ${varName}...`);
      try {
        execSync(`npx convex env set(1);
}rocess.exit p
 ge);.messaed:', erroretup faile.error('❌ Ssolconor) {
  } catch (err

dev');pm run  now run: nlog('You canonsole.ete!');
  cetup complment sronKit envi\n🎉 Liveog('e.lconsol
  }

    };
  local`)n .env.found ime} not varNa${rn(`⚠️    console.wase {
    }
    } el   );
   rror.message, e{varName}:`led to set $r(`❌ Fairole.er   consoor) {
     catch (err    } 
  `);lyccessfulme} set su${varNaole.log(`✅  cons
         });      wd()
: process.c      cwdit',
    'inhertdio: 
          s"`, { ame]}rN${envVars[va} " ${varName