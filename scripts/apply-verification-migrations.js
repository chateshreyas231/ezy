#!/usr/bin/env node
/**
 * Script to apply verification migrations (012 and 013)
 * These migrations add buyer_verified, seller_verified, and readiness_score columns
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Error: SUPABASE_URL not found in environment variables');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL or SUPABASE_URL in your .env file');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found');
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY in your .env file');
  console.error('\nYou can find your service role key in:');
  console.error('Supabase Dashboard > Settings > API > service_role key (secret)');
  process.exit(1);
}

// Read migration files
const migration012Path = resolve(__dirname, '../supabase/migrations/012_add_verification_and_documents.sql');
const migration013Path = resolve(__dirname, '../supabase/migrations/013_verification_gating_rls.sql');

let migration012, migration013;
try {
  migration012 = readFileSync(migration012Path, 'utf-8');
  migration013 = readFileSync(migration013Path, 'utf-8');
} catch (error) {
  console.error('❌ Error reading migration files:', error.message);
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration(migrationName, sql) {
  console.log(`\n🔄 Applying ${migrationName}...`);
  
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

    // Execute via REST API using the query endpoint
    const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (!projectRef) {
      throw new Error('Could not extract project ref from URL');
    }

    // Use the Management API approach - execute SQL directly
    const response = await fetch(`${SUPABASE_URL.replace('/rest/v1', '')}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    }).catch(() => null);

    if (!response || !response.ok) {
      // Fallback: Provide manual instructions
      console.log('⚠️  Could not apply migration automatically.');
      console.log('\n📋 Please apply this migration manually via Supabase Dashboard:');
      console.log(`   1. Go to: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
      console.log(`   2. Copy and paste the SQL from: supabase/migrations/${migrationName}`);
      console.log(`   3. Click "Run"`);
      return false;
    }

    console.log(`✅ ${migrationName} applied successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ Error applying ${migrationName}:`, error.message);
    console.log('\n📋 Please apply this migration manually via Supabase Dashboard:');
    const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (projectRef) {
      console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 Applying Verification Migrations');
  console.log('====================================\n');

  // Apply migration 012
  const success012 = await applyMigration('012_add_verification_and_documents.sql', migration012);
  
  if (success012) {
    // Apply migration 013
    await applyMigration('013_verification_gating_rls.sql', migration013);
  }

  console.log('\n✅ Migration process complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Re-run the seed script to update existing users:');
  console.log('      npx ts-node scripts/seed-comprehensive.ts');
  console.log('   2. Or manually update existing users in Supabase Dashboard');
}

main().catch(console.error);

