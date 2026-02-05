/**
 * Script to verify all users, buyer intents, and listings
 * Sets all verification flags to true for testing purposes
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

async function verifyAll() {
  console.log('🔐 Verifying all users, intents, and listings...\n');

  // Step 1: Verify all buyer profiles
  console.log('📋 Step 1: Verifying all buyer profiles...');
  const { data: buyers, error: buyersError } = await supabase
    .from('profiles')
    .update({
      buyer_verified: true,
      verification_level: 3,
    })
    .eq('role', 'buyer')
    .select();

  if (buyersError) {
    console.error('❌ Error verifying buyers:', buyersError);
  } else {
    console.log(`✅ Verified ${buyers?.length || 0} buyer profiles`);
  }

  // Step 2: Verify all seller profiles
  console.log('\n📋 Step 2: Verifying all seller profiles...');
  const { data: sellers, error: sellersError } = await supabase
    .from('profiles')
    .update({
      seller_verified: true,
      verification_level: 3,
    })
    .eq('role', 'seller')
    .select();

  if (sellersError) {
    console.error('❌ Error verifying sellers:', sellersError);
  } else {
    console.log(`✅ Verified ${sellers?.length || 0} seller profiles`);
  }

  // Step 3: Verify all buyer intents
  console.log('\n📋 Step 3: Verifying all buyer intents...');
  const { data: intents, error: intentsError } = await supabase
    .from('buyer_intents')
    .update({
      verified: true,
      readiness_score: 85, // Set a good readiness score
    })
    .select();

  if (intentsError) {
    console.error('❌ Error verifying buyer intents:', intentsError);
  } else {
    console.log(`✅ Verified ${intents?.length || 0} buyer intents`);
  }

  // Step 4: Verify all listings
  console.log('\n📋 Step 4: Verifying all listings...');
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .update({
      listing_verified: true,
      freshness_verified_at: new Date().toISOString(), // Set to now
    })
    .select();

  if (listingsError) {
    console.error('❌ Error verifying listings:', listingsError);
  } else {
    console.log(`✅ Verified ${listings?.length || 0} listings`);
  }

  // Step 5: Verify all other roles (agents, support, etc.)
  console.log('\n📋 Step 5: Verifying all other profiles...');
  const { data: others, error: othersError } = await supabase
    .from('profiles')
    .update({
      verification_level: 3,
    })
    .not('role', 'in', '(buyer,seller)')
    .select();

  if (othersError) {
    console.error('❌ Error verifying other profiles:', othersError);
  } else {
    console.log(`✅ Verified ${others?.length || 0} other profiles`);
  }

  console.log('\n✅ Verification complete!');
  console.log('\n📊 Summary:');
  console.log(`  - Buyers verified: ${buyers?.length || 0}`);
  console.log(`  - Sellers verified: ${sellers?.length || 0}`);
  console.log(`  - Buyer intents verified: ${intents?.length || 0}`);
  console.log(`  - Listings verified: ${listings?.length || 0}`);
  console.log(`  - Other profiles verified: ${others?.length || 0}`);
}

verifyAll()
  .then(() => {
    console.log('\n✅ All verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
