#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('👥 Checking Users\n');

  // Get all buyers
  const { data: buyers } = await supabase
    .from('profiles')
    .select('id, display_name, role, buyer_verified, verification_level')
    .eq('role', 'buyer')
    .order('display_name');

  console.log(`📊 Buyers (${buyers?.length || 0}):`);
  buyers?.forEach((b, i) => {
    console.log(`   ${i + 1}. ${b.display_name} (${b.id.substring(0, 8)}...)`);
    console.log(`      Verified: ${b.buyer_verified}, Level: ${b.verification_level}`);
  });
  console.log('');

  // Get all sellers
  const { data: sellers } = await supabase
    .from('profiles')
    .select('id, display_name, role, seller_verified')
    .eq('role', 'seller')
    .order('display_name');

  console.log(`📊 Sellers (${sellers?.length || 0}):`);
  sellers?.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.display_name} (${s.id.substring(0, 8)}...)`);
    console.log(`      Verified: ${s.seller_verified}`);
  });
  console.log('');

  // Get recent swipes
  const { data: recentSwipes } = await supabase
    .from('swipes')
    .select(`
      *,
      profile:profiles(display_name)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  console.log(`📊 Recent Swipes (${recentSwipes?.length || 0}):`);
  recentSwipes?.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.profile?.display_name} → ${s.direction.toUpperCase()} on ${s.target_type}`);
    console.log(`      Target ID: ${s.target_id.substring(0, 8)}...`);
    console.log(`      Created: ${new Date(s.created_at).toLocaleString()}`);
  });
  console.log('');

  // Get all matches
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      buyer:profiles!matches_buyer_id_fkey(display_name),
      seller:profiles!matches_seller_id_fkey(display_name),
      listing:listings(title)
    `)
    .order('created_at', { ascending: false });

  console.log(`📊 Matches (${matches?.length || 0}):`);
  if (matches && matches.length > 0) {
    matches.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.buyer?.display_name} ↔ ${m.seller?.display_name}`);
      console.log(`      Listing: ${m.listing?.title}`);
      console.log(`      Created: ${new Date(m.created_at).toLocaleString()}`);
    });
  } else {
    console.log('   ❌ No matches found in database');
  }
  console.log('');

  // Check if buyer1 swiped on seller1's listings
  if (buyers && buyers.length > 0 && sellers && sellers.length > 0) {
    const buyer1 = buyers[0];
    const seller1 = sellers[0];
    
    // Get seller1's listings
    const { data: seller1Listings } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', seller1.id)
      .eq('status', 'active');
    
    const listingIds = (seller1Listings || []).map((l: any) => l.id);

    if (listingIds.length > 0) {
      const { data: b1Swipes } = await supabase
        .from('swipes')
        .select('*')
        .eq('actor_id', buyer1.id)
        .eq('target_type', 'listing')
        .eq('direction', 'yes')
        .in('target_id', listingIds);

      console.log(`🔍 ${buyer1.display_name} swipes on ${seller1.display_name}'s listings: ${b1Swipes?.length || 0}`);
      
      // Check seller swipes on buyer intent
      const { data: buyer1Intent } = await supabase
        .from('buyer_intents')
        .select('id')
        .eq('buyer_id', buyer1.id)
        .eq('active', true)
        .single();

      if (buyer1Intent) {
        const { data: s1Swipes } = await supabase
          .from('swipes')
          .select('*')
          .eq('actor_id', seller1.id)
          .eq('target_type', 'buyer_intent')
          .eq('direction', 'yes')
          .eq('target_id', buyer1Intent.id);

        console.log(`🔍 ${seller1.display_name} swipes on ${buyer1.display_name}'s intent: ${s1Swipes?.length || 0}`);
        console.log('');

        if ((b1Swipes?.length || 0) > 0 && (s1Swipes?.length || 0) > 0) {
          console.log('🎯 BOTH PARTIES SWIPED YES!');
          console.log('   Match should exist but doesn\'t.');
          console.log('   This means match creation failed.\n');
          
          console.log('🔧 To manually create the match, run this SQL in Supabase:');
          console.log(`
INSERT INTO matches (listing_id, buyer_id, seller_id, match_score)
VALUES (
  '${listingIds[0]}',
  '${buyer1.id}',
  '${seller1.id}',
  85
)
ON CONFLICT (listing_id, buyer_id) DO NOTHING
RETURNING *;
`);
        }
      }
    }
  }
}

main();
