/**
 * Seed Script with Real US Locations
 * Creates:
 * - 20-30 sellers across different US cities with real addresses
 * - 10-15 agents near those listings
 * - 10 buyers across USA near those addresses
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

// Real US locations with addresses
const usLocations = [
  // Chicago, IL
  { city: 'Chicago', state: 'IL', public: 'Downtown Chicago, IL', private: '123 N Michigan Ave, Chicago, IL 60601', lat: 41.8781, lng: -87.6298 },
  { city: 'Chicago', state: 'IL', public: 'Lincoln Park, Chicago, IL', private: '456 W Fullerton Ave, Chicago, IL 60614', lat: 41.9250, lng: -87.6389 },
  { city: 'Chicago', state: 'IL', public: 'Wicker Park, Chicago, IL', private: '789 N Milwaukee Ave, Chicago, IL 60622', lat: 41.9075, lng: -87.6769 },
  
  // New York, NY
  { city: 'New York', state: 'NY', public: 'Manhattan, New York, NY', private: '123 Broadway, New York, NY 10007', lat: 40.7128, lng: -74.0060 },
  { city: 'New York', state: 'NY', public: 'Brooklyn Heights, New York, NY', private: '456 Montague St, Brooklyn, NY 11201', lat: 40.6962, lng: -73.9973 },
  { city: 'New York', state: 'NY', public: 'Upper East Side, New York, NY', private: '789 Park Ave, New York, NY 10021', lat: 40.7736, lng: -73.9566 },
  
  // Los Angeles, CA
  { city: 'Los Angeles', state: 'CA', public: 'Beverly Hills, Los Angeles, CA', private: '123 Rodeo Dr, Beverly Hills, CA 90210', lat: 34.0736, lng: -118.4004 },
  { city: 'Los Angeles', state: 'CA', public: 'Santa Monica, Los Angeles, CA', private: '456 Ocean Ave, Santa Monica, CA 90401', lat: 34.0195, lng: -118.4912 },
  { city: 'Los Angeles', state: 'CA', public: 'West Hollywood, Los Angeles, CA', private: '789 Sunset Blvd, West Hollywood, CA 90069', lat: 34.0900, lng: -118.3617 },
  
  // Miami, FL
  { city: 'Miami', state: 'FL', public: 'South Beach, Miami, FL', private: '123 Ocean Dr, Miami Beach, FL 33139', lat: 25.7907, lng: -80.1300 },
  { city: 'Miami', state: 'FL', public: 'Brickell, Miami, FL', private: '456 Brickell Ave, Miami, FL 33131', lat: 25.7663, lng: -80.1918 },
  
  // Austin, TX
  { city: 'Austin', state: 'TX', public: 'Downtown Austin, TX', private: '123 Congress Ave, Austin, TX 78701', lat: 30.2672, lng: -97.7431 },
  { city: 'Austin', state: 'TX', public: 'South Austin, TX', private: '456 S Lamar Blvd, Austin, TX 78704', lat: 30.2500, lng: -97.7667 },
  
  // Seattle, WA
  { city: 'Seattle', state: 'WA', public: 'Capitol Hill, Seattle, WA', private: '123 Broadway E, Seattle, WA 98102', lat: 47.6211, lng: -122.3244 },
  { city: 'Seattle', state: 'WA', public: 'Queen Anne, Seattle, WA', private: '456 Queen Anne Ave N, Seattle, WA 98109', lat: 47.6289, lng: -122.3569 },
  
  // Denver, CO
  { city: 'Denver', state: 'CO', public: 'LoDo, Denver, CO', private: '123 Larimer St, Denver, CO 80202', lat: 39.7528, lng: -104.9987 },
  { city: 'Denver', state: 'CO', public: 'Highland, Denver, CO', private: '456 W 32nd Ave, Denver, CO 80211', lat: 39.7618, lng: -105.0116 },
  
  // Boston, MA
  { city: 'Boston', state: 'MA', public: 'Back Bay, Boston, MA', private: '123 Newbury St, Boston, MA 02116', lat: 42.3505, lng: -71.0809 },
  { city: 'Boston', state: 'MA', public: 'Beacon Hill, Boston, MA', private: '456 Beacon St, Boston, MA 02108', lat: 42.3581, lng: -71.0706 },
  
  // San Francisco, CA
  { city: 'San Francisco', state: 'CA', public: 'Pacific Heights, San Francisco, CA', private: '123 Fillmore St, San Francisco, CA 94117', lat: 37.7925, lng: -122.4394 },
  { city: 'San Francisco', state: 'CA', public: 'Mission District, San Francisco, CA', private: '456 Valencia St, San Francisco, CA 94110', lat: 37.7649, lng: -122.4294 },
  
  // Portland, OR
  { city: 'Portland', state: 'OR', public: 'Pearl District, Portland, OR', private: '123 NW 11th Ave, Portland, OR 97209', lat: 45.5292, lng: -122.6819 },
  
  // Nashville, TN
  { city: 'Nashville', state: 'TN', public: 'Downtown Nashville, TN', private: '123 Broadway, Nashville, TN 37203', lat: 36.1627, lng: -86.7816 },
  
  // Phoenix, AZ
  { city: 'Phoenix', state: 'AZ', public: 'Scottsdale, Phoenix, AZ', private: '123 N Scottsdale Rd, Scottsdale, AZ 85251', lat: 33.4942, lng: -111.9261 },
  
  // Atlanta, GA
  { city: 'Atlanta', state: 'GA', public: 'Midtown, Atlanta, GA', private: '123 Peachtree St NE, Atlanta, GA 30309', lat: 33.7849, lng: -84.3844 },
  
  // Dallas, TX
  { city: 'Dallas', state: 'TX', public: 'Uptown, Dallas, TX', private: '123 McKinney Ave, Dallas, TX 75201', lat: 32.8029, lng: -96.7699 },
];

const propertyTypes = ['house', 'condo', 'townhouse', 'apartment', 'land'];
const features = [
  'garage', 'yard', 'fireplace', 'updated kitchen', 'hardwood floors',
  'city views', 'modern amenities', 'parking', 'gym', 'pool',
  'walk-in closet', 'balcony', 'patio', 'garden', 'basement',
  'central AC', 'dishwasher', 'washer/dryer', 'high ceilings', 'natural light'
];

interface SeedUser {
  email: string;
  password: string;
  role: 'buyer' | 'seller' | 'buyer_agent' | 'seller_agent';
  displayName: string;
  location?: typeof usLocations[0];
  buyerVerified?: boolean;
  sellerVerified?: boolean;
  verificationLevel?: number;
}

// Generate users with real US locations
const generateUsers = (): SeedUser[] => {
  const users: SeedUser[] = [];
  
  // 25 Sellers across different cities
  const sellerLocations = usLocations.slice(0, 25);
  sellerLocations.forEach((location, index) => {
    users.push({
      email: `seller${index + 1}@ezriya.test`,
      password: 'test123456',
      role: 'seller',
      displayName: `${location.city} Seller ${index + 1}`,
      location,
      sellerVerified: true,
      verificationLevel: 3,
    });
  });
  
  // 12 Agents (mix of buyer and seller agents) near listings
  const agentLocations = usLocations.slice(0, 12);
  agentLocations.forEach((location, index) => {
    users.push({
      email: `agent${index + 1}@ezriya.test`,
      password: 'test123456',
      role: index % 2 === 0 ? 'buyer_agent' : 'seller_agent',
      displayName: `${location.city} Agent ${index + 1}`,
      location,
      buyerVerified: true,
      sellerVerified: true,
      verificationLevel: 3,
    });
  });
  
  // 10 Buyers across USA
  const buyerLocations = [
    usLocations[0], // Chicago
    usLocations[3], // New York
    usLocations[6], // Los Angeles
    usLocations[9], // Miami
    usLocations[11], // Austin
    usLocations[13], // Seattle
    usLocations[15], // Denver
    usLocations[17], // Boston
    usLocations[19], // San Francisco
    usLocations[21], // Portland
  ];
  
  buyerLocations.forEach((location, index) => {
    users.push({
      email: `buyer${index + 1}@ezriya.test`,
      password: 'test123456',
      role: 'buyer',
      displayName: `${location.city} Buyer ${index + 1}`,
      location,
      buyerVerified: true,
      verificationLevel: 3,
    });
  });
  
  return users;
};

async function createUser(userData: SeedUser): Promise<string | null> {
  try {
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users.find(u => u.email === userData.email);
    
    if (existing) {
      console.log(`  User ${userData.email} already exists, updating profile...`);
      const readinessScore = 75 + Math.floor(Math.random() * 20);
      
      await supabase
        .from('profiles')
        .update({
          role: userData.role,
          display_name: userData.displayName,
          verification_level: userData.verificationLevel || 3,
          buyer_verified: userData.buyerVerified !== undefined ? userData.buyerVerified : (userData.role === 'buyer' || userData.role === 'buyer_agent'),
          seller_verified: userData.sellerVerified !== undefined ? userData.sellerVerified : (userData.role === 'seller' || userData.role === 'seller_agent'),
          readiness_score: readinessScore,
        })
        .eq('id', existing.id);
      return existing.id;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
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

    const readinessScore = 75 + Math.floor(Math.random() * 20);
    
    await supabase
      .from('profiles')
      .update({
        role: userData.role,
        display_name: userData.displayName,
        verification_level: userData.verificationLevel || 3,
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

async function createBuyerIntent(buyerId: string, location: typeof usLocations[0], index: number) {
  const budgets = [
    { min: 300000, max: 500000 },
    { min: 400000, max: 600000 },
    { min: 500000, max: 800000 },
    { min: 600000, max: 900000 },
    { min: 800000, max: 1200000 },
  ];

  const budget = budgets[index % budgets.length];
  const propertyTypesCount = Math.floor(Math.random() * 3) + 1;
  const selectedTypes = propertyTypes.slice(0, propertyTypesCount);

  // Create areas array with the buyer's location and nearby locations
  const nearbyLocations = usLocations
    .filter(loc => 
      Math.abs(loc.lat - location.lat) < 0.5 && 
      Math.abs(loc.lng - location.lng) < 0.5
    )
    .slice(0, 3);

  const intent = {
    buyer_id: buyerId,
    budget_min: budget.min,
    budget_max: budget.max,
    beds_min: Math.floor(Math.random() * 3) + 1,
    baths_min: Math.floor(Math.random() * 2) + 1,
    property_types: selectedTypes,
    must_haves: features.slice(0, Math.floor(Math.random() * 5) + 2),
    dealbreakers: ['busy street', 'no parking'].slice(0, Math.floor(Math.random() * 2)),
    areas: nearbyLocations.map(loc => ({ name: loc.public, lat: loc.lat, lng: loc.lng })),
    commute_anchors: [{ name: `${location.city} Downtown`, lat: location.lat, lng: location.lng }],
    active: true,
    verified: true,
    readiness_score: 75 + Math.floor(Math.random() * 20),
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

  console.log(`  ✓ Created buyer intent: $${budget.min.toLocaleString()}-${budget.max.toLocaleString()} in ${location.city}`);
  return data.id;
}

async function createListing(sellerId: string, location: typeof usLocations[0], index: number) {
  const prices = [300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1200000, 1500000];
  const price = prices[index % prices.length];
  const beds = Math.floor(Math.random() * 4) + 1;
  const baths = Math.floor(Math.random() * 3) + 1;
  const sqft = (beds * 600) + (baths * 200) + Math.floor(Math.random() * 500) + 800;

  // Add small random offset to lat/lng for variety
  const lat = location.lat + (Math.random() - 0.5) * 0.02;
  const lng = location.lng + (Math.random() - 0.5) * 0.02;

  const listing = {
    seller_id: sellerId,
    title: `Beautiful ${beds}BR ${propertyTypes[index % propertyTypes.length]} in ${location.city}`,
    description: `Stunning property with ${beds} bedrooms and ${baths} bathrooms in ${location.city}. Features include ${features.slice(0, 3).join(', ')}. Perfect location with easy access to amenities.`,
    lat,
    lng,
    address_public: location.public,
    address_private: location.private,
    price,
    beds,
    baths,
    sqft,
    property_type: propertyTypes[index % propertyTypes.length],
    features: features.slice(0, Math.floor(Math.random() * 8) + 3),
    status: 'active' as const,
    listing_verified: true,
    freshness_verified_at: new Date().toISOString(),
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

  console.log(`  ✓ Created listing: ${listing.title} - $${price.toLocaleString()}`);
  return data.id;
}

async function seed() {
  console.log('🌱 Starting US Locations seed...\n');
  console.log('⚠️  This will create 25 sellers, 12 agents, and 10 buyers across USA\n');

  // Step 1: Clear existing test data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Step 0: Clearing existing test data...');
  try {
    // Delete test users (be careful with this in production!)
    const { data: users } = await supabase.auth.admin.listUsers();
    if (users) {
      const testUsers = users.users.filter(u => 
        u.email?.endsWith('@ezriya.test')
      );
      for (const user of testUsers) {
        await supabase.auth.admin.deleteUser(user.id);
      }
      console.log(`  ✓ Deleted ${testUsers.length} existing test users`);
    }
  } catch (error: any) {
    console.log(`  ⚠️  Could not clear existing data: ${error.message}`);
  }

  // Step 1: Create users
  console.log('\n📝 Step 1: Creating users...');
  const seedUsers = generateUsers();
  const userIds: Record<string, string> = {};
  const userLocations: Record<string, typeof usLocations[0]> = {};
  
  for (const userData of seedUsers) {
    const userId = await createUser(userData);
    if (userId) {
      userIds[userData.email] = userId;
      if (userData.location) {
        userLocations[userId] = userData.location;
      }
    }
  }

  const buyerIds = Object.entries(userIds)
    .filter(([email]) => email.startsWith('buyer'))
    .map(([, id]) => id);
  
  const sellerIds = Object.entries(userIds)
    .filter(([email]) => email.startsWith('seller'))
    .map(([, id]) => id);

  const agentIds = Object.entries(userIds)
    .filter(([email]) => email.startsWith('agent'))
    .map(([, id]) => id);

  console.log(`\n✓ Created ${buyerIds.length} buyers, ${sellerIds.length} sellers, ${agentIds.length} agents\n`);

  // Step 2: Create buyer intents
  console.log('📋 Step 2: Creating buyer intents...');
  const buyerIntentIds: string[] = [];
  for (let i = 0; i < buyerIds.length; i++) {
    const buyerId = buyerIds[i];
    const location = userLocations[buyerId] || usLocations[i % usLocations.length];
    const intentId = await createBuyerIntent(buyerId, location, i);
    if (intentId) buyerIntentIds.push(intentId);
  }
  console.log(`\n✓ Created ${buyerIntentIds.length} buyer intents\n`);

  // Step 3: Create listings (one per seller)
  console.log('🏠 Step 3: Creating listings...');
  const listingIds: string[] = [];
  for (let i = 0; i < sellerIds.length; i++) {
    const sellerId = sellerIds[i];
    const location = userLocations[sellerId] || usLocations[i % usLocations.length];
    const listingId = await createListing(sellerId, location, i);
    if (listingId) listingIds.push(listingId);
  }
  console.log(`\n✓ Created ${listingIds.length} listings\n`);

  console.log('✅ Seed complete!');
  console.log(`\nSummary:`);
  console.log(`- ${buyerIds.length} buyers across USA`);
  console.log(`- ${sellerIds.length} sellers with listings`);
  console.log(`- ${agentIds.length} agents`);
  console.log(`- ${listingIds.length} listings`);
  console.log(`- ${buyerIntentIds.length} buyer intents`);
}

seed().catch(console.error);
