// services/conversationService.ts
// Conversation and pre-deal messaging management
import { supabase } from './supabaseClient';
import { logActivity } from './activityLogService';

export interface Conversation {
  id: string;
  listing_post_id: string;
  buyer_id: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  message_type: string;
  message_label?: string;
  created_at: string;
}

/**
 * Create or get existing conversation for a buyer and listing
 */
export async function getOrCreateConversation(
  listingPostId: string,
  buyerId: string
): Promise<Conversation> {
  // Check if conversation already exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('listing_post_id', listingPostId)
    .eq('buyer_id', buyerId)
    .single();

  if (existing) return existing;

  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      listing_post_id: listingPostId,
      buyer_id: buyerId,
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    entity_type: 'conversation',
    entity_id: data.id,
    action: 'conversation_created',
    meta: { listing_post_id: listingPostId, buyer_id: buyerId },
  });

  return data;
}

/**
 * Get conversations for a listing (agent view)
 */
export async function getConversationsForListing(
  listingPostId: string
): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('listing_post_id', listingPostId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get conversations for a buyer (buyer view)
 */
export async function getMyConversations(): Promise<Conversation[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('buyer_id', user.user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get all conversations for an agent (all their listings)
 */
export async function getAgentConversations(): Promise<Conversation[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get all listings for this agent
  const { data: listings } = await supabase
    .from('listing_posts')
    .select('id')
    .eq('agent_id', user.user.id);

  if (!listings || listings.length === 0) return [];

  const listingIds = listings.map(l => l.id);

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .in('listing_post_id', listingIds)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Send a message in a conversation
 */
export async function sendConversationMessage(
  conversationId: string,
  messageText: string,
  messageType: string = 'text'
): Promise<ConversationMessage> {
  const { data: user } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('conversation_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.user.id,
      message_text: messageText,
      message_type: messageType,
    })
    .select()
    .single();

  if (error) throw error;

  // Update conversation updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  // Try to triage the message (async, don't wait)
  try {
    const { data: triageResult } = await supabase.functions.invoke('triage-message', {
      body: { text: messageText },
    });

    if (triageResult?.label) {
      await supabase
        .from('conversation_messages')
        .update({ message_label: triageResult.label })
        .eq('id', data.id);
    }
  } catch (err) {
    // Triage failed, continue without label
    console.warn('Message triage failed:', err);
  }

  await logActivity({
    entity_type: 'conversation_message',
    entity_id: data.id,
    action: 'message_sent',
    meta: { conversation_id: conversationId },
  });

  return data;
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(
  conversationId: string
): Promise<ConversationMessage[]> {
  const { data, error } = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get conversation with listing and buyer info
 */
export async function getConversationWithDetails(
  conversationId: string
): Promise<{
  conversation: Conversation;
  listing: any;
  buyer: any;
  messages: ConversationMessage[];
}> {
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select(`
      *,
      listing:listing_posts(*),
      buyer:users!conversations_buyer_id_fkey(*)
    `)
    .eq('id', conversationId)
    .single();

  if (convError) throw convError;

  const messages = await getConversationMessages(conversationId);

  return {
    conversation,
    listing: (conversation as any).listing,
    buyer: (conversation as any).buyer,
    messages,
  };
}

