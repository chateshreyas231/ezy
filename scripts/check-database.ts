#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 Database Check\n');

  // Sign in as buyer1 to check data
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: 'buyer1@ezriya.test',
    password: 'test123456',
  });

  if (authError || !auth.user) {
    console.error('❌ Failed to sign in as buyer1:', authError?.message);
    return;
  }

  console.log(`✅ Signed in as buyer1: ${auth.user.id}\n`);

  // Check profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.user.id)
    .single();

  if (profileError) {
    console.error('❌ Profile error:', profileError);
  } else {
    console.log('✅ Profile:', profile);
  }
  console.log('');

  // Check buyer intent
  const { data: intent, error: intentError } = await supabase
    .from('buyer_intents')
    .select('*')
    .eq('buyer_id', auth.user.id)
    .eq('active', true);

  if (intentError) {
    console.error('❌ Intent error:', intentError);
  } else {
    console.log(`✅ Buyer intents: ${intent?.length || 0}`);
    if (intent && intent.length > 0) {
      console.log('   ', intent[0]);
    }
  }
  console.log('');

  // Check listings (should see active listings)
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id, title, price, seller_id, status')
    .eq('status', 'active')
    .limit(5);

  if (listingsError) {
    console.error('❌ Listings error:', listingsError);
  } else {
    console.log(`✅ Active listings visible to buyer: ${listings?.length || 0}`);
    listings?.forEach(l => {
      console.log(`   - ${l.title} ($${l.price.toLocaleString()})`);
    });
  }
  console.log('');

  // Check swipes
  const { data: swipes, error: swipesError } = await supabase
    .from('swipes')
    .select('*')
    .eq('actor_id', auth.user.id);

  if (swipesError) {
    console.error('❌ Swipes error:', swipesError);
  } else {
    console.log(`✅ Buyer's swipes: ${swipes?.length || 0}`);
  }
  console.log('');

  // Check matches
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('*')
    .eq('buyer_id', auth.user.id);

  if (matchesError) {
    console.error('❌ Matches error:', matchesError);
  } else {
    console.log(`✅ Buyer's matches: ${matches?.length || 0}`);
  }
}

main();
