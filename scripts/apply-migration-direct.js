#!/usr/bin/env node
/**
 * Direct migration application script
 * Uses Supabase client to execute SQL via RPC (if available)
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Error: SUPABASE_URL not found');
  process.exit(1);
}

// Read migration SQL
const migrationPath = path.join(__dirname, '../database/migrations/011_users_insert_policy.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Extract the CREATE POLICY statement
const sqlStatement = migrationSQL
  .split('\n')
  .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
  .join('\n')
  .trim();

console.log('Migration 011: Add INSERT policy for users table');
console.log('='.repeat(60));
console.log('\nSQL to execute:');
console.log(sqlStatement);
console.log('\n' + '='.repeat(60));

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n⚠️  Service role key not found.');
  console.error('To apply this migration automatically, set SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('\nOtherwise, apply it manually via Supabase Dashboard:');
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (projectRef) {
    console.error(`https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  }
  process.exit(0);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('\n🔄 Attempting to apply migration...');

// Try to execute via RPC (if exec_sql function exists)
// Otherwise, we'll need to use the Management API or direct connection
supabase.rpc('exec_sql', { query: sqlStatement })
  .then(({ data, error }) => {
    if (error) {
      // RPC might not exist, try alternative method
      console.log('⚠️  RPC method not available. Trying alternative...');
      return applyViaManagementAPI();
    }
    console.log('✅ Migration applied successfully!');
    console.log('You can now test role switching in the app.');
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    console.error('\nPlease apply the migration manually via Supabase Dashboard.');
    const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (projectRef) {
      console.error(`https://supabase.com/dashboard/project/${projectRef}/sql/new`);
    }
  });

async function applyViaManagementAPI() {
  // Supabase Management API approach
  // This requires the Management API key, not service role
  console.log('Please apply the migration manually via Supabase Dashboard.');
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (projectRef) {
    console.log(`Go to: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  }
}

