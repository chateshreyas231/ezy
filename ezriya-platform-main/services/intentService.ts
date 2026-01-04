// services/intentService.ts
// Intent entry logging
import { supabase } from './supabaseClient';
import type { IntentEntry } from '../src/types/types';
import { logActivity } from './activityLogService';

export interface CreateIntentInput {
  offer_room_id: string;
  intent_text?: string;
  offer_amount?: number;
}

/**
 * Create an intent entry
 */
export async function createIntent(input: CreateIntentInput): Promise<IntentEntry> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('intent_entries')
    .insert({
      offer_room_id: input.offer_room_id,
      user_id: user.id,
      intent_text: input.intent_text ?? null,
      offer_amount: input.offer_amount ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    entity_type: 'intent_entry',
    entity_id: data.id,
    action: 'declared_intent',
    meta: {
      offer_room_id: input.offer_room_id,
      offer_amount: input.offer_amount,
    },
  });

  return data;
}

/**
 * Get intent entries for an offer room
 */
export async function getIntentEntries(offerRoomId: string): Promise<IntentEntry[]> {
  const { data, error } = await supabase
    .from('intent_entries')
    .select('*')
    .eq('offer_room_id', offerRoomId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

