// services/mockDataService.ts
// Comprehensive mock data service for testing the matchmaking MVP

import { supabase } from './supabaseClient';

const MOCK_LISTINGS = [
  {
    title: 'Modern Downtown Loft',
    description: 'Beautiful 2-bedroom loft in the heart of downtown with stunning city views',
    price: 450000,
    beds: 2,
    baths: 2,
    sqft: 1200,
    property_type: 'Condo',
    address_public: '123 Main St, Downtown',
    address_private: '123 Main St, Apt 5B, Downtown, CA 94102',
    features: ['Parking', 'Gym', 'Rooftop Deck', 'Modern Kitchen'],
    status: 'active',
    listing_verified: true,
  },
  {
    title: 'Spacious Family Home',
    description: 'Perfect for families! 4-bedroom home with large yard and garage',
    price: 750000,
    beds: 4,
    baths: 3,
    sqft: 2500,
    property_type: 'House',
    address_public: '456 Oak Avenue, Suburbia',
    address_private: '456 Oak Avenue, Suburbia, CA 94000',
    features: ['Garage', 'Yard', 'Fireplace', 'Updated Kitchen'],
    status: 'active',
    listing_verified: true,
  },
  {
    title: 'Luxury Penthouse',
    description: 'Stunning penthouse with panoramic views and premium finishes',
    price: 1200000,
    beds: 3,
    baths: 3,
    sqft: 3000,
    property_type: 'Condo',
    address_public: '789 Skyline Blvd, Uptown',
    address_private: '789 Skyline Blvd, PH, Uptown, CA 94110',
    features: ['Parking', 'Gym', 'Concierge', 'Rooftop Pool', 'Wine Cellar'],
    status: 'active',
    listing_verified: true,
  },
  {
    title: 'Cozy Starter Home',
    description: 'Charming 2-bedroom starter home in quiet neighborhood',
    price: 350000,
    beds: 2,
    baths: 1,
    sqft: 950,
    property_type: 'House',
    address_public: '321 Elm Street, Riverside',
    address_private: '321 Elm Street, Riverside, CA 94001',
    features: ['Yard', 'Updated Bathroom'],
    status: 'active',
    listing_verified: true,
  },
  {
    title: 'Beachfront Condo',
    description: 'Ocean views from every room! Steps to the beach',
    price: 850000,
    beds: 2,
    baths: 2,
    sqft: 1400,
    property_type: 'Condo',
    address_public: '555 Ocean Drive, Beachside',
    address_private: '555 Ocean Drive, Unit 12, Beachside, CA 94002',
    features: ['Ocean View', 'Beach Access', 'Parking', 'Balcony'],
    status: 'active',
    listing_verified: true,
  },
  {
    title: 'Estate Property',
    description: 'Magnificent 5-bedroom estate on 2 acres with pool',
    price: 2500000,
    beds: 5,
    baths: 4,
    sqft: 4500,
    property_type: 'House',
    address_public: '999 Estate Lane, Hillside',
    address_private: '999 Estate Lane, Hillside, CA 94003',
    features: ['Pool', 'Garage', 'Large Yard', 'Guest House', 'Wine Cellar'],
    status: 'active',
    listing_verified: true,
  },
];

const MOCK_BUYER_INTENTS = [
  {
    budget_min: 300000,
    budget_max: 500000,
    beds_min: 2,
    baths_min: 1,
    property_types: ['House', 'Condo'],
    must_haves: ['Parking', 'Yard'],
    dealbreakers: ['No parking'],
    active: true,
  },
  {
    budget_min: 700000,
    budget_max: 1000000,
    beds_min: 3,
    baths_min: 2,
    property_types: ['House'],
    must_haves: ['Garage', 'Yard', 'Updated Kitchen'],
    dealbreakers: [],
    active: true,
  },
  {
    budget_min: 500000,
    budget_max: 800000,
    beds_min: 2,
    baths_min: 2,
    property_types: ['Condo', 'Townhouse'],
    must_haves: ['Parking', 'Gym'],
    dealbreakers: ['No parking'],
    active: true,
  },
  {
    budget_min: 2000000,
    budget_max: 3000000,
    beds_min: 4,
    baths_min: 3,
    property_types: ['House'],
    must_haves: ['Pool', 'Large Yard', 'Garage'],
    dealbreakers: [],
    active: true,
  },
];

/**
 * Create mock listings for testing
 */
export async function seedMockListings(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get or create seller profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          role: 'seller',
          display_name: user.email?.split('@')[0] || 'Seller',
          verification_level: 3,
        })
        .select()
        .single();

      if (profileError) throw profileError;
      profile = newProfile;
    }

    let created = 0;
    for (const listing of MOCK_LISTINGS) {
      const { error } = await supabase
        .from('listings')
        .insert({
          seller_id: user.id,
          ...listing,
        });

      if (!error) created++;
    }

    return { success: true, count: created };
  } catch (error: any) {
    console.error('Error seeding mock listings:', error);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Create mock buyer intents for testing
 */
export async function seedMockBuyerIntents(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get or create buyer profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          role: 'buyer',
          display_name: user.email?.split('@')[0] || 'Buyer',
          verification_level: 3,
        })
        .select()
        .single();

      if (profileError) throw profileError;
      profile = newProfile;
    }

    let created = 0;
    for (const intent of MOCK_BUYER_INTENTS) {
      const { error } = await supabase
        .from('buyer_intents')
        .insert({
          buyer_id: user.id,
          ...intent,
        });

      if (!error) created++;
    }

    return { success: true, count: created };
  } catch (error: any) {
    console.error('Error seeding mock buyer intents:', error);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Create mock matches for testing
 */
export async function seedMockMatches(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get some listings and buyer intents
    const { data: listings } = await supabase
      .from('listings')
      .select('id, seller_id')
      .eq('status', 'active')
      .limit(3);

    const { data: intents } = await supabase
      .from('buyer_intents')
      .select('id, buyer_id')
      .eq('active', true)
      .limit(3);

    if (!listings || listings.length === 0 || !intents || intents.length === 0) {
      return { success: false, count: 0, error: 'Need listings and buyer intents first' };
    }

    let created = 0;
    // Create matches between listings and intents
    for (let i = 0; i < Math.min(listings.length, intents.length); i++) {
      const { error } = await supabase
        .from('matches')
        .insert({
          buyer_id: intents[i].buyer_id,
          seller_id: listings[i].seller_id,
          listing_id: listings[i].id,
          match_score: 0.85 + Math.random() * 0.15, // 85-100% match
        });

      if (!error) created++;
    }

    return { success: true, count: created };
  } catch (error: any) {
    console.error('Error seeding mock matches:', error);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Create mock deal rooms and conversations for matches
 */
export async function seedMockDealRooms(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get matches
    const { data: matches } = await supabase
      .from('matches')
      .select('id, buyer_id, seller_id, listing_id')
      .limit(5);

    if (!matches || matches.length === 0) {
      return { success: false, count: 0, error: 'Need matches first' };
    }

    let created = 0;
    for (const match of matches) {
      // Create deal room
      const { data: dealRoom, error: dealRoomError } = await supabase
        .from('deal_rooms')
        .insert({
          match_id: match.id,
          buyer_id: match.buyer_id,
          seller_id: match.seller_id,
          status: 'active',
        })
        .select()
        .single();

      if (dealRoomError) continue;

      // Add participants
      await supabase.from('deal_participants').insert([
        { deal_room_id: dealRoom.id, profile_id: match.buyer_id, role: 'buyer' },
        { deal_room_id: dealRoom.id, profile_id: match.seller_id, role: 'seller' },
      ]);

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          deal_room_id: dealRoom.id,
        })
        .select()
        .single();

      if (!convError && conversation) {
        // Add a sample message
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          sender_profile_id: match.buyer_id,
          content: 'Hi! I\'m interested in this property. When can we schedule a viewing?',
        });
      }

      created++;
    }

    return { success: true, count: created };
  } catch (error: any) {
    console.error('Error seeding mock deal rooms:', error);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Seed all mock data
 */
export async function seedAllMockData(): Promise<{
  listings: { success: boolean; count: number };
  intents: { success: boolean; count: number };
  matches: { success: boolean; count: number };
  dealRooms: { success: boolean; count: number };
}> {
  const listings = await seedMockListings();
  const intents = await seedMockBuyerIntents();
  const matches = await seedMockMatches();
  const dealRooms = await seedMockDealRooms();

  return { listings, intents, matches, dealRooms };
}

