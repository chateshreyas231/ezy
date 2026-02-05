import { supabase } from '../supabaseClient';
import { useAuth } from './useAuth';
import { Conversation } from '@shared/types';

export function useConversations() {
  const { user } = useAuth();

  const fetchConversations = async (): Promise<Conversation[]> => {
    if (!user) throw new Error('Not authenticated');

    // Get conversations for deal rooms where user is a participant
    const { data: participants, error: participantsError } = await supabase
      .from('deal_participants')
      .select('deal_room_id')
      .eq('profile_id', user.id);

    if (participantsError) throw participantsError;

    const dealRoomIds = (participants || []).map(p => p.deal_room_id);

    if (dealRoomIds.length === 0) return [];

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .in('deal_room_id', dealRoomIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  return { fetchConversations };
}

