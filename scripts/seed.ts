/**
 * Seed script for local development
 * Creates sample listings and buyer intents for testing
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Starting seed...');

  // Note: This script assumes you have:
  // 1. Run migrations
  // 2. Created at least one test user via auth
  // 3. That user has a profile

  // Get first user (you'll need to create this manually via auth)
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError || !users || users.users.length === 0) {
    console.error('No users found. Please create a user first via Supabase Auth.');
    return;
  }

  const testUserId = users.users[0].id;
  console.log(`Using test user: ${testUserId}`);

  // Create sample listings
  const listings = [
    {
      seller_id: testUserId,
      title: 'Beautiful 3BR House in Downtown',
      description: 'Stunning modern home with updated kitchen, hardwood floors, and large backyard. Perfect for families.',
      lat: 37.7749,
      lng: -122.4194,
      address_public: 'Downtown Area, San Francisco',
      address_private: '123 Main St, San Francisco, CA 94102',
      price: 850000,
      beds: 3,
      baths: 2,
      sqft: 1800,
      property_type: 'house',
      features: ['garage', 'yard', 'fireplace', 'updated kitchen'],
      status: 'active',
      listing_verified: true,
      freshness_verified_at: new Date().toISOString(),
    },
    {
      seller_id: testUserId,
      title: 'Modern 2BR Condo with City Views',
      description: 'Luxury condo with floor-to-ceiling windows, modern amenities, and prime location.',
      lat: 37.7849,
      lng: -122.4094,
      address_public: 'Financial District, San Francisco',
      address_private: '456 Market St, San Francisco, CA 94105',
      price: 650000,
      beds: 2,
      baths: 2,
      sqft: 1200,
      property_type: 'condo',
      features: ['city views', 'modern amenities', 'parking', 'gym'],
      status: 'active',
      listing_verified: true,
      freshness_verified_at: new Date().toISOString(),
    },
    {
      seller_id: testUserId,
      title: 'Cozy 1BR Apartment Near Parks',
      description: 'Charming apartment in quiet neighborhood, close to parks and public transit.',
      lat: 37.7649,
      lng: -122.4294,
      address_public: 'Mission District, San Francisco',
      address_private: '789 Valencia St, San Francisco, CA 94110',
      price: 450000,
      beds: 1,
      baths: 1,
      sqft: 800,
      property_type: 'apartment',
      features: ['park nearby', 'public transit', 'quiet neighborhood'],
      status: 'active',
      listing_verified: true,
      freshness_verified_at: new Date().toISOString(),
    },
  ];

  console.log('Creating sample listings...');
  for (const listing of listings) {
    const { data, error } = await supabase
      .from('listings')
      .insert(listing)
      .select()
      .single();

    if (error) {
      console.error(`Failed to create listing "${listing.title}":`, error);
    } else {
      console.log(`Created listing: ${data.title} (${data.id})`);
    }
  }

  console.log('Seed complete!');
  console.log('\nNext steps:');
  console.log('1. Create a buyer intent via the app');
  console.log('2. Test the feed and swipe functionality');
  console.log('3. Create matches by swiping YES on both sides');
}

seed().catch(console.error);

