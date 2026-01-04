// services/messagesService.ts
// Message handling in offer rooms
import { supabase } from './supabaseClient';
import type { Message } from '../src/types/types';
import { logActivity } from './activityLogService';

export interface SendMessageInput {
  offer_room_id: string;
  message_text: string;
  message_type?: string;
}

/**
 * Send a message in an offer room
 */
export async function sendMessage(input: SendMessageInput): Promise<Message> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      offer_room_id: input.offer_room_id,
      sender_id: user.id,
      message_text: input.message_text,
      message_type: input.message_type ?? 'text',
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    entity_type: 'message',
    entity_id: data.id,
    action: 'sent_message',
    meta: { offer_room_id: input.offer_room_id },
  });

  return data;
}

/**
 * Get messages for an offer room
 */
export async function getMessages(offerRoomId: string, limit: number = 100): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('offer_room_id', offerRoomId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/**
 * Get latest messages for an offer room (for polling)
 */
export async function getLatestMessages(
  offerRoomId: string,
  since: string,
  limit: number = 50
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('offer_room_id', offerRoomId)
    .gt('created_at', since)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

