// services/mockListingsService.ts
// Service for creating mock listings for testing
import { supabase } from './supabaseClient';
import type { CreateListingInput, ListingPost } from '../src/types/types';

const MOCK_LISTINGS: CreateListingInput[] = [
  {
    state: 'CA',
    address: '123 Ocean Drive',
    city: 'San Francisco',
    zip: '94102',
    list_price: 1250000,
    property_type: 'Single Family',
    beds: 3,
    baths: 2.5,
  },
  {
    state: 'NY',
    address: '456 Park Avenue',
    city: 'New York',
    zip: '10001',
    list_price: 850000,
    property_type: 'Condo',
    beds: 2,
    baths: 2,
  },
  {
    state: 'TX',
    address: '789 Hill Country Lane',
    city: 'Austin',
    zip: '78701',
    list_price: 650000,
    property_type: 'Single Family',
    beds: 4,
    baths: 3,
  },
  {
    state: 'FL',
    address: '321 Beach Boulevard',
    city: 'Miami',
    zip: '33101',
    list_price: 950000,
    property_type: 'Townhouse',
    beds: 3,
    baths: 2.5,
  },
  {
    state: 'WA',
    address: '654 Pine Street',
    city: 'Seattle',
    zip: '98101',
    list_price: 750000,
    property_type: 'Single Family',
    beds: 3,
    baths: 2,
  },
];

/**
 * Create mock listings for testing
 * This bypasses compliance checks and creates verified listings
 */
export async function createMockListings(count: number = 3): Promise<ListingPost[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const listingsToCreate = MOCK_LISTINGS.slice(0, Math.min(count, MOCK_LISTINGS.length));
  const createdListings: ListingPost[] = [];

  for (const listing of listingsToCreate) {
    const { data, error } = await supabase
      .from('listing_posts')
      .insert({
        agent_id: user.id,
        state: listing.state,
        address: listing.address,
        city: listing.city,
        zip: listing.zip,
        list_price: listing.list_price,
        property_type: listing.property_type,
        beds: listing.beds,
        baths: listing.baths,
        features: {},
        verified: true, // Mark as verified for testing
        listing_status: 'live',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating mock listing:', error);
      continue;
    }

    createdListings.push(data);
  }

  return createdListings;
}

