// services/offerRoomsService.ts
// Offer room management
import { supabase } from './supabaseClient';
import type { OfferRoom } from '../src/types/types';
import { logActivity } from './activityLogService';

/**
 * Create an offer room for a match
 */
export async function createOfferRoom(matchId: string): Promise<OfferRoom> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get match to find related posts
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('buyer_need_post_id, listing_post_id')
    .eq('id', matchId)
    .single();

  if (matchError) throw matchError;
  if (!match) throw new Error('Match not found');

  // Check if offer room already exists
  const { data: existing } = await supabase
    .from('offer_rooms')
    .select('*')
    .eq('match_id', matchId)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('offer_rooms')
    .insert({
      buyer_need_post_id: match.buyer_need_post_id,
      listing_post_id: match.listing_post_id,
      match_id: matchId,
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    entity_type: 'offer_room',
    entity_id: data.id,
    action: 'opened_offer_room',
    meta: { match_id: matchId },
  });

  return data;
}

/**
 * Get offer room by ID
 */
export async function getOfferRoomById(offerRoomId: string): Promise<OfferRoom | null> {
  const { data, error } = await supabase
    .from('offer_rooms')
    .select('*')
    .eq('id', offerRoomId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Get offer room for a match
 */
export async function getOfferRoomForMatch(matchId: string): Promise<OfferRoom | null> {
  const { data, error } = await supabase
    .from('offer_rooms')
    .select('*')
    .eq('match_id', matchId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Get offer rooms for current user
 */
export async function getMyOfferRooms(): Promise<OfferRoom[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get offer rooms where user is part of the match
  const { data, error } = await supabase
    .from('offer_rooms')
    .select(`
      *,
      match:matches(
        buyer_need:buyer_need_posts!matches_buyer_need_post_id_fkey(agent_id),
        listing:listing_posts!matches_listing_post_id_fkey(agent_id)
      )
    `)
    .or(`match.buyer_need.agent_id.eq.${user.id},match.listing.agent_id.eq.${user.id}`);

  if (error) throw error;
  return (data ?? []) as OfferRoom[];
}

