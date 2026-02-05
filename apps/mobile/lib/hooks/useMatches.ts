import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';
import { Match } from '@shared/types';

export function useMatches() {
  const { user } = useAuth();

  const fetchMatches = async (): Promise<Match[]> => {
    if (!user) throw new Error('Not authenticated');

    console.log('Fetching matches for user:', user.id);

    // First, get the user's profile to determine their role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      console.log('No profile found for user');
      return [];
    }

    // Fetch matches where user is buyer or seller
    // Include both listing data (for buyers) and buyer intent + buyer profile (for sellers)
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        *,
        listing:listings (
          id,
          title,
          price,
          beds,
          baths,
          address_public,
          property_type
        ),
        buyer:profiles!matches_buyer_id_fkey (
          id,
          display_name
        ),
        seller:profiles!matches_seller_id_fkey (
          id,
          display_name
        )
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      throw matchesError;
    }

    console.log('Raw matches data:', matches);

    if (!matches || matches.length === 0) {
      console.log('No matches found for user');
      return [];
    }

    // Filter matches to only include those where the user explicitly swiped "yes"
    // For buyers: must have a "yes" swipe on the listing
    // For sellers: must have a "yes" swipe on the buyer intent
    
    let filteredMatches = [];
    
    if (profile.role === 'buyer') {
      // For buyers: get all their "yes" swipes on listings
      const buyerMatches = matches.filter(m => m.buyer_id === user.id);
      const listingIds = buyerMatches.map(m => m.listing_id);
      
      if (listingIds.length > 0) {
        const { data: userSwipes } = await supabase
          .from('swipes')
          .select('target_id')
          .eq('actor_id', user.id)
          .eq('target_type', 'listing')
          .eq('direction', 'yes')
          .in('target_id', listingIds);
        
        const swipedListingIds = new Set((userSwipes || []).map(s => s.target_id));
        filteredMatches = buyerMatches.filter(m => swipedListingIds.has(m.listing_id));
      }
    } else if (profile.role === 'seller') {
      // For sellers: get all their "yes" swipes on buyer intents
      const sellerMatches = matches.filter(m => m.seller_id === user.id);
      
      if (sellerMatches.length > 0) {
        // Get buyer IDs from matches
        const buyerIds = [...new Set(sellerMatches.map(m => m.buyer_id))];
        
        // Get active buyer intents for these buyers
        const { data: buyerIntents } = await supabase
          .from('buyer_intents')
          .select('id, buyer_id')
          .in('buyer_id', buyerIds)
          .eq('active', true);
        
        if (buyerIntents && buyerIntents.length > 0) {
          const intentIds = buyerIntents.map(i => i.id);
          
          // Get seller's "yes" swipes on these intents
          const { data: userSwipes } = await supabase
            .from('swipes')
            .select('target_id')
            .eq('actor_id', user.id)
            .eq('target_type', 'buyer_intent')
            .eq('direction', 'yes')
            .in('target_id', intentIds);
          
          const swipedIntentIds = new Set((userSwipes || []).map(s => s.target_id));
          const buyerIdToIntentId = new Map(buyerIntents.map(i => [i.buyer_id, i.id]));
          
          filteredMatches = sellerMatches.filter(m => {
            const intentId = buyerIdToIntentId.get(m.buyer_id);
            return intentId && swipedIntentIds.has(intentId);
          });
        }
      }
    }

    console.log(`Filtered matches: ${filteredMatches.length} out of ${matches.length} total matches`);
    console.log(`User role: ${profile.role}, User ID: ${user.id}`);

    if (filteredMatches.length === 0) {
      console.log('No matches with user swipes found - returning empty array');
      console.log('This means the user has not explicitly clicked MATCH on any listings that resulted in mutual matches');
      return [];
    }

    // Get all match IDs to fetch deal rooms
    const matchIds = filteredMatches.map(match => match.id);

    // Fetch deal rooms separately
    const { data: dealRooms, error: dealRoomsError } = await supabase
      .from('deal_rooms')
      .select('id, match_id')
      .in('match_id', matchIds);

    if (dealRoomsError) {
      console.error('Error fetching deal rooms:', dealRoomsError);
      throw dealRoomsError;
    }

    console.log('Deal rooms:', dealRooms);

    // Create map for deal rooms
    const dealRoomsMap = new Map((dealRooms || []).map(room => [room.match_id, room.id]));

    // For sellers, we need to fetch buyer intent data separately
    if (profile.role === 'seller') {
      const buyerIds = [...new Set(filteredMatches.map((m: any) => m.buyer_id))];
      
      // Fetch buyer intents for these buyers
      const { data: buyerIntents } = await supabase
        .from('buyer_intents')
        .select('id, buyer_id, budget_min, budget_max, readiness_score')
        .in('buyer_id', buyerIds)
        .eq('active', true);
      
      // Create map of buyer_id -> buyer_intent
      const buyerIntentMap = new Map(
        (buyerIntents || []).map((intent: any) => [intent.buyer_id, intent])
      );
      
      // Combine matches with deal room IDs and buyer intent data
      const result = filteredMatches.map((match: any) => {
        const buyer = Array.isArray(match.buyer) ? match.buyer[0] : match.buyer;
        const buyerIntent = buyerIntentMap.get(match.buyer_id);
        
        return {
          ...match,
          buyer: buyer || null,
          buyer_intent: buyerIntent || null,
          deal_room_id: dealRoomsMap.get(match.id) || null,
        };
      });
      
      console.log('Processed seller matches:', result);
      return result;
    }
    
    // For buyers, combine matches with deal room IDs
    const result = filteredMatches.map((match: any) => {
      // Handle case where listing might be an array (if join returns multiple)
      const listing = Array.isArray(match.listing) ? match.listing[0] : match.listing;
      
      return {
        ...match,
        listing: listing || null,
        deal_room_id: dealRoomsMap.get(match.id) || null,
      };
    });

    console.log('Processed matches:', result);
    return result;
  };

  return { fetchMatches };
}

