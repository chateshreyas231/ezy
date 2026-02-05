import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';

/**
 * Hook to track user swipes for listings
 * Returns a Set of listing IDs that the user has swiped "yes" on
 */
export function useUserSwipes() {
  const { user } = useAuth();
  const [matchedListingIds, setMatchedListingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMatchedListingIds(new Set());
      setLoading(false);
      return;
    }

    loadUserSwipes();
  }, [user]);

  const loadUserSwipes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Fetch actual matches (not just requests) where user is the buyer
      const { data: matches, error } = await supabase
        .from('matches')
        .select('listing_id')
        .eq('buyer_id', user.id);

      if (error) {
        console.error('Error loading user matches:', error);
        return;
      }

      // Create a Set of listing IDs that have actual matches
      const listingIds = new Set((matches || []).map(match => match.listing_id));
      setMatchedListingIds(listingIds);
    } catch (error) {
      console.error('Failed to load user matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMatchedListing = (listingId: string) => {
    setMatchedListingIds(prev => new Set([...prev, listingId]));
  };

  const isMatched = (listingId: string): boolean => {
    return matchedListingIds.has(listingId);
  };

  return {
    matchedListingIds,
    isMatched,
    addMatchedListing,
    refresh: loadUserSwipes,
    loading,
  };
}

