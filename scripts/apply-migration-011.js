#!/usr/bin/env node
/**
 * Script to apply migration 011 - Users INSERT policy
 * This fixes the RLS error when creating user profiles
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Read migration file
const migrationPath = path.join(__dirname, '../database/migrations/011_users_insert_policy.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Extract SQL statement (remove comments)
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

// Check for environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('\n❌ Error: SUPABASE_URL not found in environment variables');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  console.error('\nTo apply this migration manually:');
  console.error('1. Go to your Supabase Dashboard → SQL Editor');
  console.error('2. Copy and paste the SQL above');
  console.error('3. Click "Run"');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not found');
  console.error('This script requires the service role key to execute SQL directly.');
  console.error('\nTo apply this migration manually:');
  console.error('1. Go to your Supabase Dashboard → SQL Editor');
  console.error('2. Copy and paste the SQL above');
  console.error('3. Click "Run"');
  console.error('\nOr set SUPABASE_SERVICE_ROLE_KEY in your environment and run again.');
  process.exit(0);
}

// Execute migration via Supabase REST API
const projectUrl = SUPABASE_URL.replace('/rest/v1', '');
const sqlEndpoint = `${projectUrl}/rest/v1/rpc/exec_sql`;

const postData = JSON.stringify({
  query: sqlStatement
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
  }
};

console.log('\n🔄 Applying migration...');

const req = https.request(new URL(sqlEndpoint), options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migration applied successfully!');
      console.log('You can now test role switching in the app.');
    } else {
      console.error(`❌ Error: HTTP ${res.statusCode}`);
      console.error('Response:', data);
      console.error('\nPlease apply the migration manually via Supabase Dashboard → SQL Editor');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Network error:', error.message);
  console.error('\nPlease apply the migration manually via Supabase Dashboard → SQL Editor');
});

req.write(postData);
req.end();

