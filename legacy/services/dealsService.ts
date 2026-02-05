// services/dealsService.ts
// Deal management service
import { supabase } from './supabaseClient';
import type { Deal, DealStage } from '../src/types/types';
import { logActivity } from './activityLogService';

/**
 * Create a new deal
 */
export async function createDeal(params: {
  listing_post_id: string;
  buyer_id: string;
  seller_id?: string;
  buyer_agent_id?: string;
  seller_agent_id?: string;
  offer_room_id?: string;
  stage?: DealStage;
}): Promise<Deal> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('deals')
    .insert({
      listing_post_id: params.listing_post_id,
      buyer_id: params.buyer_id,
      seller_id: params.seller_id || null,
      buyer_agent_id: params.buyer_agent_id || null,
      seller_agent_id: params.seller_agent_id || null,
      offer_room_id: params.offer_room_id || null,
      stage: params.stage || 'active_search',
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    entity_type: 'deal',
    entity_id: data.id,
    action: 'created',
    meta: { stage: data.stage },
  });

  return data;
}

/**
 * Get deal by ID
 */
export async function getDealById(dealId: string): Promise<Deal | null> {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', dealId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Get deals for current user
 */
export async function getMyDeals(): Promise<Deal[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id},buyer_agent_id.eq.${user.id},seller_agent_id.eq.${user.id}`)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get deals for a listing
 */
export async function getDealsForListing(listingPostId: string): Promise<Deal[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('listing_post_id', listingPostId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Update deal stage
 */
export async function updateDealStage(dealId: string, newStage: DealStage): Promise<Deal> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('deals')
    .update({ stage: newStage })
    .eq('id', dealId)
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    entity_type: 'deal',
    entity_id: dealId,
    action: 'stage_updated',
    meta: { new_stage: newStage },
  });

  return data;
}

/**
 * Update deal participants
 */
export async function updateDealParticipants(
  dealId: string,
  updates: {
    seller_id?: string;
    buyer_agent_id?: string;
    seller_agent_id?: string;
  }
): Promise<Deal> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('deals')
    .update(updates)
    .eq('id', dealId)
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    entity_type: 'deal',
    entity_id: dealId,
    action: 'participants_updated',
    meta: updates,
  });

  return data;
}

