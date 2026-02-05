// services/paymentsService.ts
// Match unlock payment flow (stub for MVP)
import { supabase } from './supabaseClient';
import type { MatchUnlock } from '../src/types/types';
import { logActivity } from './activityLogService';

const UNLOCK_FEE = 25.00; // Flat fee in dollars (MVP stub)

/**
 * Check if a match is already unlocked by the current user
 */
export async function isMatchUnlocked(
  buyerNeedPostId: string,
  listingPostId: string
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('match_unlocks')
    .select('id')
    .eq('user_id', user.id)
    .eq('buyer_need_post_id', buyerNeedPostId)
    .eq('listing_post_id', listingPostId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return false;
    throw error;
  }

  return !!data;
}

/**
 * Unlock a match (stub payment for MVP)
 * In production, this would integrate with Stripe or similar
 */
export async function unlockMatch(
  buyerNeedPostId: string,
  listingPostId: string
): Promise<MatchUnlock> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if already unlocked
  const alreadyUnlocked = await isMatchUnlocked(buyerNeedPostId, listingPostId);
  if (alreadyUnlocked) {
    const { data } = await supabase
      .from('match_unlocks')
      .select('*')
      .eq('user_id', user.id)
      .eq('buyer_need_post_id', buyerNeedPostId)
      .eq('listing_post_id', listingPostId)
      .single();
    if (data) return data;
  }

  // MVP: Stub payment - just create the unlock record
  // TODO: Integrate with Stripe or payment provider
  const { data, error } = await supabase
    .from('match_unlocks')
    .insert({
      user_id: user.id,
      buyer_need_post_id: buyerNeedPostId,
      listing_post_id: listingPostId,
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    entity_type: 'match_unlock',
    entity_id: data.id,
    action: 'unlocked_match',
    meta: {
      buyer_need_post_id: buyerNeedPostId,
      listing_post_id: listingPostId,
      fee: UNLOCK_FEE,
    },
  });

  return data;
}

/**
 * Get unlock fee amount
 */
export function getUnlockFee(): number {
  return UNLOCK_FEE;
}

