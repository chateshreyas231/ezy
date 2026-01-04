// services/postsService.ts
// Buyer need posts and listing posts CRUD
import { canUser } from '../logic/complianceRules';
import type { BuyerNeedPost, CreateBuyerNeedInput, CreateListingInput, ListingPost } from '../src/types/types';
import { logActivity } from './activityLogService';
import { supabase } from './supabaseClient';

/**
 * Create a buyer need post
 */
export async function createBuyerNeedPost(input: CreateBuyerNeedInput): Promise<BuyerNeedPost> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get user role and state for compliance check
  const { data: userData } = await supabase
    .from('users')
    .select('role, state')
    .eq('id', user.id)
    .single();

  if (!userData) throw new Error('User profile not found');
  if (!userData.state) throw new Error('User state not set');

  // Check compliance
  if (!canUser('uploadBuyerNeed', userData.role as any, userData.state)) {
    throw new Error('You do not have permission to create buyer need posts in this state');
  }

  const { data, error } = await supabase
    .from('buyer_need_posts')
    .insert({
      agent_id: user.id,
      state: input.state,
      city: input.city ?? null,
      zip: input.zip ?? null,
      radius_miles: input.radius_miles ?? null,
      price_min: input.price_min ?? null,
      price_max: input.price_max ?? null,
      property_type: input.property_type ?? null,
      beds: input.beds ?? null,
      baths: input.baths ?? null,
      features: input.features ?? {},
    })
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await logActivity({
    entity_type: 'buyer_need_post',
    entity_id: data.id,
    action: 'created_buyer_need',
    meta: { state: input.state },
  });

  return data;
}

/**
 * Get buyer need posts for current user
 */
export async function getMyBuyerNeedPosts(): Promise<BuyerNeedPost[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('buyer_need_posts')
    .select('*')
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get buyer need post by ID
 */
export async function getBuyerNeedPostById(id: string): Promise<BuyerNeedPost | null> {
  const { data, error } = await supabase
    .from('buyer_need_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Update buyer need post
 */
export async function updateBuyerNeedPost(id: string, input: Partial<CreateBuyerNeedInput>): Promise<BuyerNeedPost> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('buyer_need_posts')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('agent_id', user.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Buyer need post not found or access denied');

  await logActivity({
    entity_type: 'buyer_need_post',
    entity_id: id,
    action: 'updated_buyer_need',
  });

  return data;
}

/**
 * Delete buyer need post
 */
export async function deleteBuyerNeedPost(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('buyer_need_posts')
    .delete()
    .eq('id', id)
    .eq('agent_id', user.id);

  if (error) throw error;

  await logActivity({
    entity_type: 'buyer_need_post',
    entity_id: id,
    action: 'deleted_buyer_need',
  });
}

/**
 * Create a listing post
 */
export async function createListingPost(input: CreateListingInput): Promise<ListingPost> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get user role and state for compliance check
  const { data: userData } = await supabase
    .from('users')
    .select('role, state')
    .eq('id', user.id)
    .single();

  if (!userData) throw new Error('User profile not found');
  if (!userData.state) throw new Error('User state not set');

  // Check compliance
  if (!canUser('uploadListingPost', userData.role as any, userData.state)) {
    throw new Error('You do not have permission to create listing posts in this state');
  }

  const { data, error } = await supabase
    .from('listing_posts')
    .insert({
      agent_id: user.id,
      state: input.state,
      address: input.address ?? null,
      city: input.city ?? null,
      zip: input.zip ?? null,
      list_price: input.list_price,
      property_type: input.property_type ?? null,
      beds: input.beds ?? null,
      baths: input.baths ?? null,
      features: input.features ?? {},
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    entity_type: 'listing_post',
    entity_id: data.id,
    action: 'created_listing',
    meta: { state: input.state, list_price: input.list_price },
  });

  return data;
}

/**
 * Get listing posts for current user
 */
export async function getMyListingPosts(): Promise<ListingPost[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('listing_posts')
    .select('*')
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get all listing posts for feed
 */
export async function getAllListingPosts(limit: number = 50): Promise<ListingPost[]> {
  const { data, error } = await supabase
    .from('listing_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/**
 * Get listing post by ID
 */
export async function getListingPostById(id: string): Promise<ListingPost | null> {
  const { data, error } = await supabase
    .from('listing_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Update listing post
 */
export async function updateListingPost(id: string, input: Partial<CreateListingInput>): Promise<ListingPost> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('listing_posts')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('agent_id', user.id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Listing post not found or access denied');

  await logActivity({
    entity_type: 'listing_post',
    entity_id: id,
    action: 'updated_listing',
  });

  return data;
}

/**
 * Delete listing post
 */
export async function deleteListingPost(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('listing_posts')
    .delete()
    .eq('id', id)
    .eq('agent_id', user.id);

  if (error) throw error;

  await logActivity({
    entity_type: 'listing_post',
    entity_id: id,
    action: 'deleted_listing',
  });
}

