/**
 * Script to apply migration 015 - Allow sellers to view buyer swipes on their listings
 * This fixes the RLS policy so sellers can see buyer requests
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Read migration SQL
const migrationPath = path.join(__dirname, '../supabase/migrations/015_seller_view_buyer_swipes.sql');
const sqlStatement = fs.readFileSync(migrationPath, 'utf8');

// Check for environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('\n❌ Error: SUPABASE_URL not found in environment variables');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  console.error('\nTo apply this migration manually:');
  console.error('1. Go to your Supabase Dashboard → SQL Editor');
  console.error('2. Copy and paste the SQL from: supabase/migrations/015_seller_view_buyer_swipes.sql');
  console.error('3. Click "Run"');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not found');
  console.error('This script requires the service role key to execute SQL directly.');
  console.error('\nTo apply this migration manually:');
  console.error('1. Go to your Supabase Dashboard → SQL Editor');
  console.error('2. Copy and paste the SQL from: supabase/migrations/015_seller_view_buyer_swipes.sql');
  console.error('3. Click "Run"');
  console.error('\nOr set SUPABASE_SERVICE_ROLE_KEY in your .env file and run again.');
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

console.log('\n🔄 Applying migration 015: Allow sellers to view buyer swipes...');
console.log('This will update the RLS policy so sellers can see buyer requests on their listings.\n');

const req = https.request(new URL(sqlEndpoint), options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migration 015 applied successfully!');
      console.log('Sellers can now see buyer swipes (requests) on their listings.');
      console.log('\nNext steps:');
      console.log('1. Run: npx ts-node scripts/cleanup-archived-swipes.ts');
      console.log('2. Test: As buyer1, swipe MATCH on a listing');
      console.log('3. Check: Seller Leads tab should now show the request');
    } else {
      console.error(`❌ Error: HTTP ${res.statusCode}`);
      console.error('Response:', data);
      console.error('\nPlease apply the migration manually via Supabase Dashboard.');
      const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
      if (projectRef) {
        console.error(`Go to: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
      }
      console.error('\nCopy and paste the SQL from: supabase/migrations/015_seller_view_buyer_swipes.sql');
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
  console.error('\nCopy and paste the SQL from: supabase/migrations/015_seller_view_buyer_swipes.sql');
});

req.write(postData);
req.end();
