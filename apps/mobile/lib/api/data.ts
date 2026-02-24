import { supabase } from '../supabase';
import type { DealRoomRecord, ListingWithMedia, MatchRecord } from '../types/app';

type DirectoryRow = {
  id: string;
  display_name: string | null;
  role: string;
  verification_level: number;
};

export async function fetchActiveListings(): Promise<ListingWithMedia[]> {
  const { data, error } = await supabase
    .from('listings')
    .select(
      'id,seller_id,title,description,price,beds,baths,sqft,property_type,features,status,created_at,address_public,listing_media(id,storage_path,media_type,order_index)',
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data as ListingWithMedia[]) ?? [];
}

export async function fetchMyListings(profileId: string): Promise<ListingWithMedia[]> {
  const { data, error } = await supabase
    .from('listings')
    .select(
      'id,seller_id,title,description,price,beds,baths,sqft,property_type,features,status,created_at,address_public,listing_media(id,storage_path,media_type,order_index)',
    )
    .eq('seller_id', profileId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data as ListingWithMedia[]) ?? [];
}

export async function createListing(input: {
  sellerId: string;
  title: string;
  description?: string;
  addressPublic?: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  propertyType: string;
  features: string[];
  status?: 'draft' | 'active';
}) {
  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: input.sellerId,
      title: input.title,
      description: input.description || null,
      address_public: input.addressPublic || null,
      price: input.price,
      beds: input.beds,
      baths: input.baths,
      sqft: input.sqft || null,
      property_type: input.propertyType,
      features: input.features,
      status: input.status || 'draft',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function fetchMyMatches(profileId: string): Promise<MatchRecord[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(
      'id,listing_id,buyer_id,seller_id,match_score,explanation,created_at,listing:listings(title,price,beds,baths)',
    )
    .or(`buyer_id.eq.${profileId},seller_id.eq.${profileId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as MatchRecord[]) ?? [];
}

export async function fetchDealRoomsForProfile(profileId: string): Promise<DealRoomRecord[]> {
  const { data: participants, error: pErr } = await supabase
    .from('deal_participants')
    .select('deal_room_id')
    .eq('profile_id', profileId);

  if (pErr) throw pErr;
  const roomIds = (participants ?? []).map((p) => p.deal_room_id);
  if (roomIds.length === 0) return [];

  const { data, error } = await supabase
    .from('deal_rooms')
    .select('id,match_id,status,created_at')
    .in('id', roomIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DealRoomRecord[]) ?? [];
}

export async function fetchTasks(dealRoomId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('deal_room_id', dealRoomId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function updateTaskStatus(taskId: string, status: 'todo' | 'doing' | 'done') {
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId);

  if (error) throw error;
}

export async function fetchConversation(dealRoomId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('id,deal_room_id')
    .eq('deal_room_id', dealRoomId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('id,conversation_id,sender_profile_id,message_text,created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    conversation_id: row.conversation_id,
    sender_profile_id: row.sender_profile_id,
    content: row.message_text,
    created_at: row.created_at,
  }));
}

export async function sendMessage(conversationId: string, senderProfileId: string, content: string) {
  const { data: conversation, error: cErr } = await supabase
    .from('conversations')
    .select('deal_room_id')
    .eq('id', conversationId)
    .single();

  if (cErr) throw cErr;

  const { data: dealRoom, error: drErr } = await supabase
    .from('deal_rooms')
    .select('match_id')
    .eq('id', conversation.deal_room_id)
    .single();

  if (drErr) throw drErr;

  const { data: offerRoom, error: orErr } = await supabase
    .from('offer_rooms')
    .select('id')
    .eq('match_id', dealRoom.match_id)
    .maybeSingle();

  if (orErr) throw orErr;

  let offerRoomId = offerRoom?.id ?? null;
  if (!offerRoomId) {
    const { data: createdOfferRoom, error: createErr } = await supabase
      .from('offer_rooms')
      .insert({ match_id: dealRoom.match_id })
      .select('id')
      .single();

    if (createErr) throw createErr;
    offerRoomId = createdOfferRoom.id;
  }

  const { error } = await supabase.from('messages').insert({
    offer_room_id: offerRoomId,
    sender_id: senderProfileId,
    conversation_id: conversationId,
    sender_profile_id: senderProfileId,
    message_text: content,
  });

  if (error) throw error;
}

export async function fetchDirectory() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,display_name,role,verification_level')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw error;

  const rows = (data ?? []) as DirectoryRow[];
  const clients = rows.filter((r) => r.role === 'buyer' || r.role === 'seller');
  const agents = rows.filter((r) => r.role === 'buyer_agent');
  const brokersVendors = rows.filter((r) => r.role === 'seller_agent');

  return {
    clients,
    agents,
    brokersVendors,
  };
}

export async function runSwipe(params: {
  targetType: 'listing' | 'buyer_intent';
  targetId: string;
  direction: 'yes' | 'no';
}) {
  const { data, error } = await supabase.functions.invoke('create-swipe', {
    body: {
      target_type: params.targetType,
      target_id: params.targetId,
      direction: params.direction,
    },
  });

  if (error) throw error;
  return data;
}

export async function getAiSummary(text: string, type = 'listing') {
  const { data, error } = await supabase.functions.invoke('ai-summary', {
    body: { text, type },
  });

  if (error) throw error;
  return (data?.summary as string) ?? '';
}
