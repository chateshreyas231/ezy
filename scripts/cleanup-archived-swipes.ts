/**
 * Cleanup Script - Remove all archived swipes (no direction swipes)
 * This ensures the archived tab is empty until buyers explicitly archive listings
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  process.env.EXPO_PUBLIC_SUPABASE_KEY || 
  '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function cleanupArchivedSwipes() {
  console.log('🧹 Cleaning up archived swipes (no direction)...\n');

  // Delete all "no" swipes (archived) for listings
  const { data: deletedSwipes, error } = await supabase
    .from('swipes')
    .delete()
    .eq('direction', 'no')
    .eq('target_type', 'listing')
    .select();

  if (error) {
    console.error('❌ Error deleting archived swipes:', error);
    return;
  }

  console.log(`✅ Deleted ${deletedSwipes?.length || 0} archived swipes`);
  console.log('   Archived tab will now be empty until buyers explicitly archive listings\n');
}

cleanupArchivedSwipes()
  .then(() => {
    console.log('✅ Cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });
