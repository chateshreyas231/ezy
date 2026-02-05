#!/usr/bin/env ts-node
/**
 * Diagnose Matching Issue
 * 
 * Checks the current state of swipes, matches, and data
 */

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
  console.log('🔍 Diagnosing Matching Issue\n');

  // Get buyer1 and seller1
  const { data: buyer } = await supabase
    .from('profiles')
    .select('*')
    .ilike('display_name', '%buyer 1%')
    .single();

  const { data: seller } = await supabase
    .from('profiles')
    .select('*')
    .ilike('display_name', '%seller 1%')
    .single();

  if (!buyer || !seller) {
    console.error('❌ Could not find buyer1 or seller1');
    return;
  }

  console.log('✅ Found test users:');
  console.log(`   Buyer: ${buyer.display_name} (${buyer.id})`);
  console.log(`   Seller: ${seller.display_name} (${seller.id})\n`);

  // Check buyer intent
  const { data: buyerIntent } = await supabase
    .from('buyer_intents')
    .select('*')
    .eq('buyer_id', buyer.id)
    .eq('active', true)
    .single();

  if (!buyerIntent) {
    console.log('❌ Buyer has no active intent\n');
  } else {
    console.log('✅ Buyer intent:');
    console.log(`   ID: ${buyerIntent.id}`);
    console.log(`   Budget: $${buyerIntent.budget_min?.toLocaleString()} - $${buyerIntent.budget_max?.toLocaleString()}`);
    console.log(`   Beds: ${buyerIntent.beds_min}+, Baths: ${buyerIntent.baths_min}+\n`);
  }

  // Check seller listings
  const { data: sellerListings } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', seller.id)
    .eq('status', 'active');

  if (!sellerListings || sellerListings.length === 0) {
    console.log('❌ Seller has no active listings\n');
  } else {
    console.log(`✅ Seller has ${sellerListings.length} active listing(s):`);
    sellerListings.forEach(listing => {
      console.log(`   - ${listing.title} (${listing.id})`);
      console.log(`     Price: $${listing.price.toLocaleString()}, ${listing.beds} bed, ${listing.baths} bath`);
    });
    console.log('');
  }

  // Check buyer swipes on seller's listings
  if (sellerListings && sellerListings.length > 0) {
    const listingIds = sellerListings.map(l => l.id);
    
    const { data: buyerSwipes } = await supabase
      .from('swipes')
      .select('*')
      .eq('actor_id', buyer.id)
      .eq('target_type', 'listing')
      .eq('direction', 'yes')
      .in('target_id', listingIds);

    console.log(`🔍 Buyer swipes on seller's listings: ${buyerSwipes?.length || 0}`);
    if (buyerSwipes && buyerSwipes.length > 0) {
      buyerSwipes.forEach(swipe => {
        const listing = sellerListings.find(l => l.id === swipe.target_id);
        console.log(`   ✅ YES on: ${listing?.title || swipe.target_id}`);
        console.log(`      Swipe ID: ${swipe.id}`);
        console.log(`      Created: ${new Date(swipe.created_at).toLocaleString()}`);
      });
    } else {
      console.log('   ❌ Buyer has NOT swiped YES on any of seller\'s listings');
    }
    console.log('');
  }

  // Check seller swipes on buyer intent
  if (buyerIntent) {
    const { data: sellerSwipes } = await supabase
      .from('swipes')
      .select('*')
      .eq('actor_id', seller.id)
      .eq('target_type', 'buyer_intent')
      .eq('direction', 'yes')
      .eq('target_id', buyerIntent.id);

    console.log(`🔍 Seller swipes on buyer's intent: ${sellerSwipes?.length || 0}`);
    if (sellerSwipes && sellerSwipes.length > 0) {
      sellerSwipes.forEach(swipe => {
        console.log(`   ✅ YES on buyer intent`);
        console.log(`      Swipe ID: ${swipe.id}`);
        console.log(`      Created: ${new Date(swipe.created_at).toLocaleString()}`);
      });
    } else {
      console.log('   ❌ Seller has NOT swiped YES on buyer\'s intent');
    }
    console.log('');
  }

  // Check for matches
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      listing:listings(title, price),
      buyer:profiles!matches_buyer_id_fkey(display_name),
      seller:profiles!matches_seller_id_fkey(display_name)
    `)
    .or(`buyer_id.eq.${buyer.id},seller_id.eq.${seller.id}`);

  console.log(`🔍 Matches: ${matches?.length || 0}`);
  if (matches && matches.length > 0) {
    matches.forEach(match => {
      console.log(`   ✅ Match found!`);
      console.log(`      Match ID: ${match.id}`);
      console.log(`      Listing: ${match.listing?.title}`);
      console.log(`      Buyer: ${match.buyer?.display_name}`);
      console.log(`      Seller: ${match.seller?.display_name}`);
      console.log(`      Created: ${new Date(match.created_at).toLocaleString()}`);
    });
  } else {
    console.log('   ❌ No matches found');
  }
  console.log('');

  // Summary
  console.log('📊 Summary:');
  console.log('─────────────────────────────────────');
  
  const buyerSwipedYes = sellerListings && sellerListings.length > 0 ? 
    (await supabase
      .from('swipes')
      .select('id')
      .eq('actor_id', buyer.id)
      .eq('target_type', 'listing')
      .eq('direction', 'yes')
      .in('target_id', sellerListings.map(l => l.id))).data?.length || 0 : 0;

  const sellerSwipedYes = buyerIntent ?
    (await supabase
      .from('swipes')
      .select('id')
      .eq('actor_id', seller.id)
      .eq('target_type', 'buyer_intent')
      .eq('direction', 'yes')
      .eq('target_id', buyerIntent.id)).data?.length || 0 : 0;

  console.log(`Buyer has active intent: ${buyerIntent ? '✅' : '❌'}`);
  console.log(`Seller has active listings: ${sellerListings && sellerListings.length > 0 ? '✅' : '❌'}`);
  console.log(`Buyer swiped YES on seller's listing: ${buyerSwipedYes > 0 ? '✅' : '❌'}`);
  console.log(`Seller swiped YES on buyer's intent: ${sellerSwipedYes > 0 ? '✅' : '❌'}`);
  console.log(`Match exists: ${matches && matches.length > 0 ? '✅' : '❌'}`);
  console.log('');

  if (buyerSwipedYes > 0 && sellerSwipedYes > 0 && (!matches || matches.length === 0)) {
    console.log('🔴 ISSUE: Both parties swiped YES but no match was created!');
    console.log('   This means the match creation logic failed.');
    console.log('   Check the app console logs when seller swipes YES.\n');
  } else if (buyerSwipedYes === 0) {
    console.log('⚠️  Buyer needs to swipe YES on seller\'s listing first');
  } else if (sellerSwipedYes === 0) {
    console.log('⚠️  Seller needs to swipe YES on buyer\'s intent');
  } else if (matches && matches.length > 0) {
    console.log('✅ Match exists! Check the Matches tab in the app.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
