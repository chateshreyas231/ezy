#!/usr/bin/env node
/**
 * Script to apply waitlist backup migration
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
const migrationPath = path.join(__dirname, '../supabase/migrations/20260213000000_add_waitlist_backup.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('Applying Waitlist Backup Migration');
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
    process.exit(0);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

console.log('\n🔄 Attempting to apply migration via RPC (exec_sql)...');

async function applyMigration() {
    const { data, error } = await supabase.rpc('exec_sql', { query: migrationSQL });

    if (error) {
        console.error('❌ RPC Error:', error.message);
        if (error.message.includes('function "exec_sql" does not exist') || error.message.includes('Could not find the function')) {
            console.log('\n⚠️  The "exec_sql" RPC function is not installed in your instance.');
            console.log('You need to run the following SQL once in Supabase Dashboard SQL Editor to enable remote migrations:');
            console.log(`
create or replace function exec_sql(query text)
returns void
language plpgsql
security definer
as $$
begin
  execute query;
end;
$$;
      `);
        } else {
            console.error('Details:', error);
        }

        console.log('\nPlease apply the migration manually via Supabase Dashboard.');
        return;
    }

    console.log('✅ Migration applied successfully!');
}

applyMigration().catch(err => {
    console.error('Unexpected error:', err);
});
