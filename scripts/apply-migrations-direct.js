#!/usr/bin/env node
/**
 * Direct migration application script
 * Attempts to apply migrations via Supabase Management API
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Error: SUPABASE_URL not found');
  process.exit(1);
}

// Read combined migration
const migrationPath = path.join(__dirname, '../database/migrations/014_combined_fixes.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('Migration 014: Combined Fixes');
console.log('='.repeat(60));
console.log('\nSQL to execute:');
console.log(migrationSQL);
console.log('\n' + '='.repeat(60));

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n⚠️  Service role key not found.');
  console.error('To apply this migration automatically, set SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('\nOtherwise, apply it manually via Supabase Dashboard:');
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (projectRef) {
    console.error(`https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  }
  console.error('\nOr run: ./apply-all-migrations.sh');
  process.exit(0);
}

// Try to execute via Supabase Management API
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const managementApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

console.log('\n🔄 Attempting to apply migration via Management API...');

const postData = JSON.stringify({
  query: migrationSQL
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'apikey': SUPABASE_SERVICE_ROLE_KEY
  }
};

const req = https.request(managementApiUrl, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migration applied successfully!');
      console.log('You can now test listing creation and role switching.');
    } else {
      console.error(`❌ Error: HTTP ${res.statusCode}`);
      console.error('Response:', data);
      console.error('\nPlease apply the migration manually via Supabase Dashboard.');
      const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
      if (projectRef) {
        console.error(`Go to: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Network error:', error.message);
  console.error('\nPlease apply the migration manually via Supabase Dashboard.');
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (projectRef) {
    console.error(`Go to: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  }
  console.error('\nOr run: ./apply-all-migrations.sh');
});

req.write(postData);
req.end();

