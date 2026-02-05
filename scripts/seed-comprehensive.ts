/**
 * Comprehensive Seed Script for Ezriya Platform
 * Creates mock data for all user roles and features:
 * - Multiple users (buyer, seller, agent, support)
 * - Buyer intents
 * - Listings
 * - Swipes (matches and archived)
 * - Matches
 * - Deal rooms
 * - Tasks
 * - Messages
 * - Documents
 */

// Load environment variables from .env file
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from root directory (process.cwd() is the project root)
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { createClient } from '@supabase/supabase-js';

// Check for both EXPO_PUBLIC_ (mobile app) and non-prefixed (server-side) env vars
const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  process.env.EXPO_PUBLIC_SUPABASE_KEY || 
  '';

// Warn if using anon key instead of service role key
if (!process.env.SUPABASE_SERVICE_ROLE_KEY && (process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY)) {
  console.warn('⚠️  WARNING: Using anon key instead of service role key.');
  console.warn('   Some operations (like creating users) require SUPABASE_SERVICE_ROLE_KEY.');
  console.warn('   Get it from: Supabase Dashboard > Settings > API > service_role key\n');
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('For full seeding, use SUPABASE_SERVICE_ROLE_KEY (from Supabase Dashboard > Settings > API)');
  process.exit(1);
}

// Use service role key to bypass RLS for seeding
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface SeedUser {
  email: string;
  password: string;
  role: 'buyer' | 'seller' | 'buyer_agent' | 'seller_agent' | 'support';
  displayName: string;
  buyerVerified?: boolean;
  sellerVerified?: boolean;
  verificationLevel?: number;
}

const seedUsers: SeedUser[] = [
  // Buyers - ALL VERIFIED
  {
    email: 'buyer1@ezriya.test',
    password: 'test123456',
    role: 'buyer',
    displayName: 'Alice Buyer',
    buyerVerified: true,
    verificationLevel: 3,
  },
  {
    email: 'buyer2@ezriya.test',
    password: 'test123456',
    role: 'buyer',
    displayName: 'Bob Buyer',
    buyerVerified: true, // Changed to true - all buyers verified
    verificationLevel: 3, // Changed to 3 - all buyers fully verified
  },
  // Sellers - ALL VERIFIED
  {
    email: 'seller1@ezriya.test',
    password: 'test123456',
    role: 'seller',
    displayName: 'Diana Seller',
    sellerVerified: true,
    verificationLevel: 3,
  },
];

const propertyTypes = ['house', 'condo', 'townhouse', 'apartment', 'land'];
const features = [
  'garage', 'yard', 'fireplace', 'updated kitchen', 'hardwood floors',
  'city views', 'modern amenities', 'parking', 'gym', 'pool',
  'walk-in closet', 'balcony', 'patio', 'garden', 'basement',
  'central AC', 'dishwasher', 'washer/dryer', 'high ceilings', 'natural light'
];

const addresses = [
  { public: 'Downtown Area, San Francisco', private: '123 Main St, San Francisco, CA 94102', lat: 37.7749, lng: -122.4194 },
  { public: 'Financial District, San Francisco', private: '456 Market St, San Francisco, CA 94105', lat: 37.7849, lng: -122.4094 },
  { public: 'Mission District, San Francisco', private: '789 Valencia St, San Francisco, CA 94110', lat: 37.7649, lng: -122.4294 },
  { public: 'Pacific Heights, San Francisco', private: '321 Pacific Ave, San Francisco, CA 94115', lat: 37.7925, lng: -122.4394 },
  { public: 'Noe Valley, San Francisco', private: '654 24th St, San Francisco, CA 94114', lat: 37.7510, lng: -122.4319 },
  { public: 'Marina District, San Francisco', private: '987 Chestnut St, San Francisco, CA 94123', lat: 37.8024, lng: -122.4368 },
  { public: 'Hayes Valley, San Francisco', private: '147 Hayes St, San Francisco, CA 94102', lat: 37.7767, lng: -122.4228 },
  { public: 'Castro District, San Francisco', private: '258 Castro St, San Francisco, CA 94114', lat: 37.7614, lng: -122.4345 },
];

async function createUser(userData: SeedUser): Promise<string | null> {
  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users.find(u => u.email === userData.email);
    
    if (existing) {
      console.log(`  User ${userData.email} already exists, updating profile and password...`);
      
      // Reset password to ensure it matches seed data
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        existing.id,
        { password: userData.password }
      );
      
      if (passwordError) {
        console.error(`  Failed to update password for ${userData.email}:`, passwordError.message);
      } else {
        console.log(`  ✓ Password reset for ${userData.email}`);
      }
      
      // Update profile
      // Note: Requires migration 012 for buyer_verified and seller_verified columns
      // Ensure all test users are verified with high readiness scores for testing
      const readinessScore = userData.verificationLevel && userData.verificationLevel >= 2 
        ? 75 + Math.floor(Math.random() * 20) // 75-95 for verified users
        : 50 + Math.floor(Math.random() * 20); // 50-70 for unverified
      
      await supabase
        .from('profiles')
        .update({
          role: userData.role,
          display_name: userData.displayName,
          verification_level: userData.verificationLevel || 2, // Default to level 2 for testing
          buyer_verified: userData.buyerVerified !== undefined ? userData.buyerVerified : (userData.role === 'buyer' || userData.role === 'buyer_agent'),
          seller_verified: userData.sellerVerified !== undefined ? userData.sellerVerified : (userData.role === 'seller' || userData.role === 'seller_agent'),
          readiness_score: readinessScore,
        })
        .eq('id', existing.id);
      return existing.id;
    }

    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm for testing
      user_metadata: {
        display_name: userData.displayName,
        role: userData.role,
      },
    });

    if (error) {
      console.error(`  Failed to create user ${userData.email}:`, error.message);
      return null;
    }

    if (!data.user) {
      console.error(`  No user returned for ${userData.email}`);
      return null;
    }

    // Update profile with verification data
    // Note: Requires migration 012 for buyer_verified and seller_verified columns
    // Ensure all test users are verified with high readiness scores for testing
    const readinessScore = userData.verificationLevel && userData.verificationLevel >= 2 
      ? 75 + Math.floor(Math.random() * 20) // 75-95 for verified users
      : 50 + Math.floor(Math.random() * 20); // 50-70 for unverified
    
    await supabase
      .from('profiles')
      .update({
        role: userData.role,
        display_name: userData.displayName,
        verification_level: userData.verificationLevel || 2, // Default to level 2 for testing
        buyer_verified: userData.buyerVerified !== undefined ? userData.buyerVerified : (userData.role === 'buyer' || userData.role === 'buyer_agent'),
        seller_verified: userData.sellerVerified !== undefined ? userData.sellerVerified : (userData.role === 'seller' || userData.role === 'seller_agent'),
        readiness_score: readinessScore,
      })
      .eq('id', data.user.id);

    console.log(`  ✓ Created user: ${userData.email} (${userData.role})`);
    return data.user.id;
  } catch (error: any) {
    console.error(`  ✗ Error creating user ${userData.email}:`, error.message);
    return null;
  }
}

async function createBuyerIntent(buyerId: string, index: number, verified: boolean = true) {
  const budgets = [
    { min: 400000, max: 600000 },
    { min: 600000, max: 900000 },
    { min: 800000, max: 1200000 },
    { min: 500000, max: 800000 },
  ];

  const budget = budgets[index % budgets.length];
  const propertyTypesCount = Math.floor(Math.random() * 3) + 1;
  const selectedTypes = propertyTypes.slice(0, propertyTypesCount);

  const intent = {
    buyer_id: buyerId,
    budget_min: budget.min,
    budget_max: budget.max,
    beds_min: Math.floor(Math.random() * 3) + 1,
    baths_min: Math.floor(Math.random() * 2) + 1,
    property_types: selectedTypes,
    must_haves: features.slice(0, Math.floor(Math.random() * 5) + 2),
    dealbreakers: ['busy street', 'no parking'].slice(0, Math.floor(Math.random() * 2)),
    areas: addresses.slice(0, 2).map(a => ({ name: a.public, lat: a.lat, lng: a.lng })),
    commute_anchors: [{ name: 'Downtown Office', lat: 37.7749, lng: -122.4194 }],
    active: true,
    // Note: Requires migration 012 for verified and readiness_score columns
    verified: verified,
    readiness_score: verified ? (75 + Math.floor(Math.random() * 20)) : (50 + Math.floor(Math.random() * 20)),
  };

  const { data, error } = await supabase
    .from('buyer_intents')
    .insert(intent)
    .select()
    .single();

  if (error) {
    console.error(`  ✗ Failed to create buyer intent:`, error.message);
    return null;
  }

  console.log(`  ✓ Created buyer intent: $${budget.min.toLocaleString()}-${budget.max.toLocaleString()}`);
  return data.id;
}

// Asset files from /assests folder (paired with listings)
const videoAssets = [
  'assests/5644324-hd_1080_1920_25fps.mp4',
  'assests/14806962_3840_2160_50fps.mp4',
  'assests/14806878_3840_2160_50fps.mp4',
  'assests/9490333-uhd_2160_3840_25fps.mp4',
  'assests/8321912-uhd_2160_4096_25fps.mp4',
  'assests/7647324-uhd_2160_3840_24fps.mp4',
  'assests/7578552-uhd_3840_2160_30fps.mp4',
  'assests/7348157-uhd_3840_2160_25fps.mp4',
  'assests/3444433-hd_1920_1080_30fps.mp4',
  'assests/3444429-hd_1920_1080_30fps.mp4',
  'assests/2887459-hd_1920_1080_25fps.mp4',
  'assests/2253719-uhd_4096_2160_30fps.mp4',
  'assests/1093658-uhd_3840_2160_30fps.mp4',
  'assests/857282-uhd_3840_2160_30fps.mp4',
  'assests/856661-hd_1920_1080_25fps.mp4',
];

const imageAssets = [
  'assests/pexels-bianeyre-1560065.jpg',
  'assests/pexels-dropshado-2251247.jpg',
  'assests/pexels-ekrulila-2128329.jpg',
  'assests/pexels-emrecan-2079249.jpg',
  'assests/pexels-falling4utah-1080696.jpg',
  'assests/pexels-falling4utah-2724749.jpg',
  'assests/pexels-fotios-photos-3820420.jpg',
  'assests/pexels-frans-van-heerden-201846-1438832.jpg',
  'assests/pexels-isabella-mendes-107313-1795508.jpg',
  'assests/pexels-julia-kuzenkov-442028-1974596.jpg',
  'assests/pexels-pixabay-209296.jpg',
  'assests/pexels-pixabay-221540.jpg',
  'assests/pexels-pixabay-259588.jpg',
  'assests/pexels-pixabay-462205.jpg',
  'assests/pexels-pixabay-53610.jpg',
  'assests/pexels-pixasquare-1115804.jpg',
  'assests/pexels-sebastian-palomino-933481-1862402.jpg',
];

async function createListing(sellerId: string, index: number) {
  const address = addresses[index % addresses.length];
  const prices = [450000, 550000, 650000, 750000, 850000, 950000, 1100000, 1200000, 1300000, 1400000, 600000, 700000, 800000, 900000, 1000000];
  const price = prices[index % prices.length];
  const beds = Math.floor(Math.random() * 4) + 1; // 1-4 beds
  const baths = Math.floor(Math.random() * 3) + 1; // 1-3 baths
  const sqft = (beds * 600) + (baths * 200) + Math.floor(Math.random() * 500) + 800;

  const listing = {
    seller_id: sellerId,
    title: `Beautiful ${beds}BR ${propertyTypes[index % propertyTypes.length]} in ${address.public.split(',')[0]}`,
    description: `Stunning property with ${beds} bedrooms and ${baths} bathrooms. Features include ${features.slice(0, 3).join(', ')}. Perfect location with easy access to amenities.`,
    lat: address.lat + (Math.random() - 0.5) * 0.01,
    lng: address.lng + (Math.random() - 0.5) * 0.01,
    address_public: address.public,
    address_private: address.private,
    price,
    beds,
    baths,
    sqft,
    property_type: propertyTypes[index % propertyTypes.length],
    features: features.slice(0, Math.floor(Math.random() * 8) + 3),
    status: 'active' as const,
    listing_verified: true, // ALL listings verified
    freshness_verified_at: new Date().toISOString(), // Always fresh
  };

  const { data, error } = await supabase
    .from('listings')
    .insert(listing)
    .select()
    .single();

  if (error) {
    console.error(`  ✗ Failed to create listing:`, error.message);
    return null;
  }

  // Add media to listing (mix of videos and images for reels effect)
  const mediaCount = Math.floor(Math.random() * 3) + 1; // 1-3 media items
  const hasVideo = Math.random() > 0.3; // 70% chance of having a video
  
  for (let i = 0; i < mediaCount; i++) {
    let mediaType: 'video' | 'image';
    let assetFile: string;
    
    if (i === 0 && hasVideo) {
      // First item is often a video for reels effect
      mediaType = 'video';
      assetFile = videoAssets[(index + i) % videoAssets.length];
    } else {
      mediaType = 'image';
      assetFile = imageAssets[(index + i) % imageAssets.length];
    }

    // Store as local asset path (in production, upload to Supabase Storage and use public URL)
    const storagePath = assetFile; // Already includes 'assests/' prefix

    const { error: mediaError } = await supabase
      .from('listing_media')
      .insert({
        listing_id: data.id,
        storage_path: storagePath,
        media_type: mediaType,
        order_index: i,
      });

    if (mediaError) {
      console.error(`  ✗ Failed to add media to listing:`, mediaError.message);
    }
  }

  console.log(`  ✓ Created listing: ${listing.title} ($${price.toLocaleString()}) with ${mediaCount} media items`);
  return data.id;
}

async function createSwipe(actorId: string, targetType: 'listing' | 'buyer_intent', targetId: string, direction: 'yes' | 'no') {
  const { error } = await supabase
    .from('swipes')
    .upsert({
      actor_id: actorId,
      target_type: targetType,
      target_id: targetId,
      direction,
    }, {
      onConflict: 'actor_id,target_type,target_id',
    });

  if (error) {
    console.error(`  ✗ Failed to create swipe:`, error.message);
    return false;
  }
  return true;
}

async function createMatch(listingId: string, buyerId: string, sellerId: string) {
  const matchScore = 75 + Math.floor(Math.random() * 20);
  const explanations = [
    'Great match on budget and property type preferences.',
    'Strong alignment on location and must-have features.',
    'Property meets all key requirements and budget range.',
    'Excellent fit based on commute anchors and area preferences.',
  ];

  const { data, error } = await supabase
    .from('matches')
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
      match_score: matchScore,
      explanation: explanations[Math.floor(Math.random() * explanations.length)],
    })
    .select()
    .single();

  if (error) {
    console.error(`  ✗ Failed to create match:`, error.message);
    return null;
  }

  console.log(`  ✓ Created match (score: ${matchScore}%)`);
  return data.id;
}

async function createDealRoom(matchId: string, buyerId: string, sellerId: string, agentIds: string[]) {
  const { data: dealRoom, error: drError } = await supabase
    .from('deal_rooms')
    .insert({
      match_id: matchId,
      status: 'matched',
    })
    .select()
    .single();

  if (drError) {
    console.error(`  ✗ Failed to create deal room:`, drError.message);
    return null;
  }

  // Create participants
  const participants = [
    { deal_room_id: dealRoom.id, profile_id: buyerId, role_in_deal: 'buyer' },
    { deal_room_id: dealRoom.id, profile_id: sellerId, role_in_deal: 'seller' },
    ...agentIds.map(agentId => ({
      deal_room_id: dealRoom.id,
      profile_id: agentId,
      role_in_deal: agentIds.indexOf(agentId) === 0 ? 'buyer_agent' : 'seller_agent',
    })),
  ];

  for (const participant of participants) {
    await supabase.from('deal_participants').insert(participant);
  }

  // Create conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .insert({ deal_room_id: dealRoom.id })
    .select()
    .single();

  // Create initial messages
  let messageCount = 0;
  if (conversation) {
    const messages = [
      { conversation_id: conversation.id, sender_profile_id: buyerId, content: 'Hi! I\'m interested in this property. When can we schedule a viewing?' },
      { conversation_id: conversation.id, sender_profile_id: sellerId, content: 'Great! I\'m available this weekend. Would Saturday afternoon work for you?' },
      { conversation_id: conversation.id, sender_profile_id: buyerId, content: 'Perfect! Saturday at 2pm works for me. See you then!' },
    ];

    for (const message of messages) {
      await supabase.from('messages').insert(message);
      messageCount++;
    }
  }

  // Create initial tasks
  const tasks = [
    { deal_room_id: dealRoom.id, assignee_profile_id: buyerId, title: 'Schedule property viewing', status: 'done' },
    { deal_room_id: dealRoom.id, assignee_profile_id: buyerId, title: 'Get pre-approval letter', status: 'doing' },
    { deal_room_id: dealRoom.id, assignee_profile_id: sellerId, title: 'Prepare property for showing', status: 'todo' },
    { deal_room_id: dealRoom.id, assignee_profile_id: sellerId, title: 'Gather property documents', status: 'todo' },
  ];

  for (const task of tasks) {
    await supabase.from('tasks').insert({
      ...task,
      description: `Task for ${task.title}`,
      due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  console.log(`  ✓ Created deal room with ${participants.length} participants, ${messageCount} messages, ${tasks.length} tasks`);
  return dealRoom.id;
}

async function seed() {
  console.log('🌱 Starting comprehensive seed...\n');
  console.log('⚠️  Note: Make sure migrations 001, 002, 003, 012, and 013 are applied first!\n');

  // Step 1: Create users
  console.log('📝 Step 1: Creating users...');
  const userIds: Record<string, string> = {};
  
  for (const userData of seedUsers) {
    const userId = await createUser(userData);
    if (userId) {
      userIds[userData.email] = userId;
    }
  }

  const buyerIds = Object.entries(userIds)
    .filter(([email]) => email.startsWith('buyer'))
    .map(([, id]) => id);
  
  const sellerIds = Object.entries(userIds)
    .filter(([email]) => email.startsWith('seller'))
    .map(([, id]) => id);

  console.log(`\n✓ Created ${Object.keys(userIds).length} users\n`);

  // Step 2: Create buyer intents - ALL VERIFIED
  console.log('📋 Step 2: Creating buyer intents (ALL VERIFIED)...');
  const buyerIntentIds: string[] = [];
  // ALL buyers have verified intents
  for (let i = 0; i < buyerIds.length; i++) {
    const verified = true; // ALL buyer intents are verified
    const intentId = await createBuyerIntent(buyerIds[i], i, verified);
    if (intentId) buyerIntentIds.push(intentId);
    console.log(`  ✓ Created buyer intent for buyer${i + 1}@ezriya.test (verified: ${verified})`);
  }
  console.log(`\n✓ Created ${buyerIntentIds.length} buyer intents (ALL VERIFIED)\n`);

  // Step 3: Create listings (ALL listings belong to seller1@ezriya.test)
  console.log('🏠 Step 3: Creating listings (all for seller1)...');
  const listingIds: string[] = [];
  // Create more listings for testing (all belong to seller1)
  const totalListings = 20; // Increased for better testing
  for (let i = 0; i < totalListings; i++) {
    const sellerId = sellerIds[0]; // ALL listings belong to seller1@ezriya.test
    const listingId = await createListing(sellerId, i);
    if (listingId) listingIds.push(listingId);
  }
  console.log(`\n✓ Created ${listingIds.length} listings (ALL belong to seller1@ezriya.test)\n`);

  // Step 4: Create swipes (requests only - NO archived swipes)
  // IMPORTANT: We don't create "no" swipes (archived) in seed data
  // Archived tab should only show listings the buyer explicitly archives in the app
  console.log('👆 Step 4: Creating swipes (requests only)...');
  let requestCount = 0;

  // Buyers swipe on listings (creates requests, not matches)
  // buyer1 (verified intent) creates requests on first 2 listings
  // buyer2 (unverified intent) creates some swipes but won't show as requests (unverified)
  for (let i = 0; i < buyerIds.length; i++) {
    const buyerId = buyerIds[i];
    for (let j = 0; j < listingIds.length; j++) {
      const listingId = listingIds[j];
      // buyer1 (verified) creates requests on first 2 listings
      if (i === 0 && j < 2) {
        await createSwipe(buyerId, 'listing', listingId, 'yes');
        requestCount++;
        console.log(`  ✓ buyer1 swiped YES on listing ${j + 1} (request created)`);
      } else if (i === 1 && j < 2) {
        // buyer2 (unverified) also swipes YES, but won't show as request (unverified intent)
        await createSwipe(buyerId, 'listing', listingId, 'yes');
        console.log(`  ✓ buyer2 swiped YES on listing ${j + 1} (won't show as request - unverified intent)`);
      }
      // NOTE: We intentionally do NOT create "no" swipes (archived) here
      // The archived tab should only show listings the buyer explicitly archives in the app
    }
  }

  console.log(`\n✓ Created ${requestCount} requests from buyers\n`);
  console.log(`  Note: ALL buyers have verified intents - all requests will appear in seller Leads`);
  console.log(`  Note: No archived swipes created - archived tab will be empty until buyer archives listings\n`);

  // Step 5: Sellers accept requests (creates matches)
  console.log('💚 Step 5: Sellers accepting requests (creating matches)...');
  const matchIds: string[] = [];
  
  // For buyer1's requests on first 2 listings, sellers accept them
  // Since seed script uses direct DB inserts (not edge function), we need to manually create matches
  for (let i = 0; i < 2 && i < listingIds.length && i < buyerIds.length; i++) {
    const listingId = listingIds[i];
    const buyerId = buyerIds[0];
    const sellerId = sellerIds[i % sellerIds.length];
    
    // Check if buyer swiped YES on this listing (request exists)
    const { data: buyerSwipe } = await supabase
      .from('swipes')
      .select('*')
      .eq('actor_id', buyerId)
      .eq('target_type', 'listing')
      .eq('target_id', listingId)
      .eq('direction', 'yes')
      .single();
    
    if (buyerSwipe && buyerIntentIds[0]) {
      // Seller accepts the request by swiping YES on buyer's intent
      await createSwipe(sellerId, 'buyer_intent', buyerIntentIds[0], 'yes');
      
      // Manually create match (since seed script bypasses edge function)
      const matchId = await createMatch(listingId, buyerId, sellerId);
      if (matchId) {
        matchIds.push(matchId);
      }
    }
  }
  
  console.log(`\n✓ Created ${matchIds.length} matches from accepted requests\n`);

  // Step 6: Create deal rooms
  console.log('🏢 Step 6: Creating deal rooms...');
  const dealRoomIds: string[] = [];
  
  for (let i = 0; i < matchIds.length; i++) {
    const match = await supabase
      .from('matches')
      .select('listing_id, buyer_id, seller_id')
      .eq('id', matchIds[i])
      .single();

    if (match.data) {
      const dealRoomId = await createDealRoom(
        matchIds[i],
        match.data.buyer_id,
        match.data.seller_id,
        [] // No agents for testing
      );
      if (dealRoomId) dealRoomIds.push(dealRoomId);
    }
  }
  console.log(`\n✓ Created ${dealRoomIds.length} deal rooms\n`);

  console.log('✅ Seed complete!\n');
  console.log('📊 Summary:');
  console.log(`  - Users: ${Object.keys(userIds).length}`);
  console.log(`  - Buyer Intents: ${buyerIntentIds.length}`);
  console.log(`  - Listings: ${listingIds.length}`);
  console.log(`  - Matches: ${matchIds.length}`);
  console.log(`  - Deal Rooms: ${dealRoomIds.length}\n`);
  console.log('🔑 Test Accounts:');
  console.log('  Buyers:');
  console.log('    - buyer1@ezriya.test / test123456 (verified intent)');
  console.log('    - buyer2@ezriya.test / test123456 (unverified intent)');
  console.log('  Sellers:');
  console.log('    - seller1@ezriya.test / test123456 (verified)\n');
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});

