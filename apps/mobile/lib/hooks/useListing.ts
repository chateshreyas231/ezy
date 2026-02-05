import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';
import { Listing } from '@shared/types';

export function useListing() {
  const { user } = useAuth();

  const createListing = async (listingData: Omit<Listing, 'id' | 'seller_id' | 'listing_verified' | 'freshness_verified_at' | 'created_at'>) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('listings')
      .insert({
        ...listingData,
        seller_id: user.id,
        listing_verified: false,
        freshness_verified_at: null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const getCurrentListing = async () => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  };

  return { createListing, getCurrentListing };
}

