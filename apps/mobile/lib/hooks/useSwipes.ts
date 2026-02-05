import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';
import { Swipe } from '@shared/types';

export function useSwipes() {
  const { user } = useAuth();

  const fetchArchived = async (): Promise<any[]> => {
    if (!user) throw new Error('Not authenticated');

    // Fetch archived swipes (polymorphic relationship, so we fetch separately)
    // Only fetch swipes where the user explicitly swiped "no" (archived)
    // This ensures only listings the user explicitly archived are shown
    const { data: swipes, error: swipesError } = await supabase
      .from('swipes')
      .select('*')
      .eq('actor_id', user.id) // Only current user's swipes
      .eq('direction', 'no') // Only "no" swipes (archived)
      .eq('target_type', 'listing') // Only listing swipes
      .order('created_at', { ascending: false });

    if (swipesError) {
      console.error('Error fetching archived swipes:', swipesError);
      throw swipesError;
    }

    // If no swipes, return empty array (don't show anything)
    // This ensures the archived tab is empty by default
    if (!swipes || swipes.length === 0) {
      return [];
    }

    // Get all listing IDs from swipes
    const listingIds = swipes
      .map(swipe => swipe.target_id)
      .filter((id): id is string => !!id); // Filter out any null/undefined IDs

    if (listingIds.length === 0) {
      return [];
    }

    // Fetch listings separately
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, price, beds, baths, address_public, property_type')
      .in('id', listingIds);

    if (listingsError) {
      console.error('Error fetching listings:', listingsError);
      throw listingsError;
    }

    // Create a map of listings by ID for quick lookup
    const listingsMap = new Map((listings || []).map(listing => [listing.id, listing]));

    // Combine swipes with their listings
    // Only return swipes that have valid listings
    // This ensures we only show listings the user explicitly archived
    const result = swipes
      .map(swipe => ({
        ...swipe,
        listing: listingsMap.get(swipe.target_id) || null,
      }))
      .filter(item => item.listing !== null); // Only return items with valid listings

    return result;
  };

  return { fetchArchived };
}

