// services/matchesService.ts
// Matching logic and match queries
import { supabase } from './supabaseClient';
import type { Match, BuyerNeedPost, ListingPost } from '../src/types/types';
import { calculateMatchScore } from '../logic/matchingLogic';
import { logActivity } from './activityLogService';

/**
 * Generate matches for a buyer need post
 */
export async function generateMatchesForBuyerNeed(buyerNeedPostId: string): Promise<Match[]> {
  // Get the buyer need post
  const { data: buyerNeed, error: buyerError } = await supabase
    .from('buyer_need_posts')
    .select('*')
    .eq('id', buyerNeedPostId)
    .single();

  if (buyerError) throw buyerError;
  if (!buyerNeed) throw new Error('Buyer need post not found');

  // Find potential matching listing posts
  let query = supabase
    .from('listing_posts')
    .select('*')
    .eq('state', buyerNeed.state);

  // Apply filters
  if (buyerNeed.city) {
    query = query.eq('city', buyerNeed.city);
  }
  if (buyerNeed.zip) {
    query = query.eq('zip', buyerNeed.zip);
  }
  if (buyerNeed.price_min && buyerNeed.price_max) {
    query = query
      .lte('list_price', buyerNeed.price_max)
      .gte('list_price', buyerNeed.price_min);
  }
  if (buyerNeed.property_type) {
    query = query.eq('property_type', buyerNeed.property_type);
  }

  const { data: listings, error: listingsError } = await query;

  if (listingsError) throw listingsError;
  if (!listings || listings.length === 0) return [];

  // Calculate match scores and create matches
  const matches: Match[] = [];
  for (const listing of listings) {
    const score = calculateMatchScore(buyerNeed, listing);
    if (score > 0) {
      // Check if match already exists
      const { data: existing } = await supabase
        .from('matches')
        .select('id')
        .eq('buyer_need_post_id', buyerNeedPostId)
        .eq('listing_post_id', listing.id)
        .single();

      if (!existing) {
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert({
            buyer_need_post_id: buyerNeedPostId,
            listing_post_id: listing.id,
            score,
          })
          .select()
          .single();

        if (matchError) {
          console.error('Failed to create match:', matchError);
          continue;
        }

        matches.push(match);

        await logActivity({
          entity_type: 'match',
          entity_id: match.id,
          action: 'generated_match',
          meta: { buyer_need_post_id: buyerNeedPostId, listing_post_id: listing.id, score },
        });
      }
    }
  }

  return matches;
}

/**
 * Get matches for a buyer need post
 */
export async function getMatchesForBuyerNeed(buyerNeedPostId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('buyer_need_post_id', buyerNeedPostId)
    .order('score', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get matches for a listing post
 */
export async function getMatchesForListing(listingPostId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('listing_post_id', listingPostId)
    .order('score', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get match by ID
 */
export async function getMatchById(matchId: string): Promise<Match | null> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Get match with related posts
 */
export async function getMatchWithPosts(matchId: string): Promise<{
  match: Match;
  buyerNeed: BuyerNeedPost;
  listing: ListingPost;
} | null> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      buyer_need:buyer_need_posts(*),
      listing:listing_posts(*)
    `)
    .eq('id', matchId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    match: data,
    buyerNeed: (data as any).buyer_need,
    listing: (data as any).listing,
  };
}

/**
 * Get match count for a buyer need post
 */
export async function getMatchCountForBuyerNeed(buyerNeedPostId: string): Promise<number> {
  const { count, error } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('buyer_need_post_id', buyerNeedPostId);

  if (error) throw error;
  return count ?? 0;
}

